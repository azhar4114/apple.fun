const anim = ["animate__zoomOutRight", "animate__hinge", "animate__rotateOut", "animate__shakeY", "animate__rubberBand", "animate__headShake", "animate__swing", "animate__tada", "animate__wobble", "animate__jello", "animate__heartBeat", "animate__shakeX", "animate__rotateIn"];
var an = 0,
    expl = !1,
    gap = 2000,
    cards;
	
	function attachListeners(){
    cards = document.querySelectorAll('.button');
    $(cards).attr("tabindex", "0");
    console.log($(".buttons"), cards)
    $(".button").click(function() {
        if (!aud.paused)
            return;
        console.log(anim[an], an, this);
        $(this).addClass(anim[an]);
        var ind = $(this).attr('data');
        aud.currentTime = audTime[ind].s;
        aud.play();
        setTimeout(function() {
            aud.pause()
        }, (audTime[ind].e - audTime[ind].s) * 1000);
        $(this).addClass("clicked");
        this.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        if ($(".clicked").length == audTime.length && !expl) {
            explodeConfetti();
            expl = !0
        }
    })
}

$(document).ready(function() {
    var intv;
    $(".toggle-button.play").click(function(e) {
        if (!$("body").hasClass("cursor-hide")) {
            $("body").addClass("cursor-hide")
        }
        var i = 0;
        var bt = $(".button");
        if (intv != null) {
            $(this).html("Play");
            clearInterval(intv);
            $(".autoplay").removeClass("autoplay");
            $(this).addClass("active");
            intv = null;
            return
        }
        $(this).removeClass("active");
        $(this).html("Stop");
        intv = setInterval(function() {
            $(".autoplay").removeClass("autoplay");
            $(bt[i]).addClass("autoplay");
            $(bt[i++]).click();
            if (i > audTime.length - 1) {
                setTimeout(function() {
                    $(".toggle-button.play").html("Play");
                    clearInterval(intv);
                    $(".autoplay").removeClass("autoplay");
                    $(".toggle-button.play").addClass("active");
                    intv = null
                }, 1000)
            }
        }, gap)
    });
	
});

function explodeConfetti() {
    confetti({
        particleCount: 300,
        spread: 300,
        origin: {
            y: .5
        }
    })
}
const scrollToTopBtn = document.getElementById("scrollToTopBtn");
window.onscroll = function() {
    scrollFunction()
};

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollToTopBtn.style.display = "block"
    } else {
        scrollToTopBtn.style.display = "none"
    }
}
scrollToTopBtn.addEventListener("click", function() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0
});
document.addEventListener('mousemove', function(e) {
    $("body").removeClass("cursor-hide")
});
let currentIndex = -1;

function focusCard(index) {
    cards[index].focus();
    if (!$("body").hasClass("cursor-hide")) {
        $("body").addClass("cursor-hide")
    }
}
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowRight':
            currentIndex = (currentIndex + 1 + cards.length) % cards.length;
            focusCard(currentIndex);
            break;
        case 'ArrowLeft':
            currentIndex = (currentIndex - 1 + cards.length) % cards.length;
            focusCard(currentIndex);
            break;
        case 'Enter':
        case ' ':
            cards[currentIndex].click();
            break;
        default:
            break
    }
})