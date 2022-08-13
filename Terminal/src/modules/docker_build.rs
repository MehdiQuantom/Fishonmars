//! Module that pretends to build Docker images
use async_trait::async_trait;
use rand::prelude::*;
use rand::Rng;

use crate::args::AppConfig;
use crate::data::DOCKER_PACKAGES_LIST;
use crate::data::DOCKER_TAGS_LIST;
use crate::generators::gen_hex_string;
use crate::io::{csleep, dprint, newline, print};
use crate::modules::Module;
use crate::ALL_MODULES;

pub struct DockerBuild;

#[async_trait(?Send)]
impl Module for DockerBuild {
    fn name(&self) -> &'static str {
        "docker_build"
    }

    fn signature(&self) -> String {
        "docker build -t image .".to_string()
    }

    async fn run(&self, appconfig: &AppConfig) {
        let mut rng = thread_rng();

        // Output the sending of the context to Docker
        let target_size: f64 = rng.gen_range(100.0..1000.0);
        let mut current_size: f64 = 0.0;

        while current_size <= target_size {
            dprint(
                format!(
                    "\rSending build context to Docker daemon  {current_size:>4.2}MB",
                    current_size = current_size
                ),
                0,
            )
            .await;

            let remaining_size = target_size - current_size;
            if remaining_size <= 5.0 {
                current_size += 5.0;
            } else {
                current_size += rng.gen_range(5.0..30.0);
            }

            if appconfig.should_exit() {
                return;
            }

            csleep(200).await;
        }

        // Loop trough a set number of steps
        let total_steps = rng.gen_range(30..100);
        let mut current_step = 1_i32;

        while current_step <= total_steps {
            // Choose a random instruction
            let chosen_module = ALL_MODULES
                .iter()
                .filter(|(k, _)| !k.starts_with("docker"))
                .choose(&mut rng)
                .unwrap()
                .1;

            // Print the current step with the instruction to run
            print(format!(
                "\rStep {current_step}/{total_steps} : {instruction}",
                current_step = current_step,
                total_steps = total_steps,
                instruction = ["RUN", &chosen_module.signature()].join(" "),
            ))
            .await;
            newline().await;

            if rand::random() {
                print(" ---> Using cache").await;
            } else {
                print(format!(
                    " ---> Running in {step_hash}",
                    step_hash = gen_hex_string(&mut rng, 12),
                ))
                .await;
                newline().await;

                chosen_module.run(appconfig).await;
            }

            print(format!(
                " ---> {step_hash}",
                step_hash = gen_hex_string(&mut rng, 12),
            ))
            .await;
            newline().await;

            if appconfig.should_exit() {
                return;
            }

            current_step += 1;
            csleep(rng.gen_range(300..1000)).await;
        }

        // Print the final lines
        let hash = gen_hex_string(&mut rng, 12);
        let image: &&str = DOCKER_PACKAGES_LIST.choose(&mut rng).unwrap();
        let image_tag: &&str = DOCKER_TAGS_LIST.choose(&mut rng).unwrap();

        print(format!("Successfully built {hash}", hash = hash)).await;

        print(format!(
            "Successfully tagged {image}:{tag}",
            image = image,
            tag = image_tag
        ))
        .await;

        if appconfig.should_exit() {
            return;
        }
    }
}
