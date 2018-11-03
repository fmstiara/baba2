$(function() {

	$(document).on("click", ".start_btn", function() {
		$(".top_text, .start_btn").hide();
		$(".sign_modal, .sign_in_modal").show();
	})

	$(document).on("click", ".sign_btn", function() {
		if ($(this).hasClass("sign_up_btn")) {
			$(".sign_in_modal").hide();
			$(".sign_up_modal").show();
		} else {
			$(".sign_up_modal").hide();
			$(".sign_in_modal").show();
		}
	})

	var counter = 0;
	var timerId = setInterval(function(){
		$(".top_title span").eq(counter).css("display", "inline-block");
		$(".top_title span").eq(counter).addClass("magictime vanishIn");
		if (counter >= 4){
				clearInterval(timerId);
		}
		counter++;
	}, 200);
})