$(document).ready(function() {
	var progressbar = $('#bar'),
		max = progressbar.attr('max'),
		time = (2/max)*600,
	    value = progressbar.val();

	var loading = function() {
	    value += 1;
	    addValue = progressbar.val(value);

	    if (value == max) {
	        clearInterval(animate);			 }
	};

	var animate = setInterval(function() {
	    loading();
	}, time);
});