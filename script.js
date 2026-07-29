const anim = ["animate__zoomOutRight", "animate__hinge", "animate__rotateOut", "animate__shakeY", "animate__rubberBand", "animate__headShake", "animate__swing", "animate__tada", "animate__wobble", "animate__jello", "animate__heartBeat", "animate__shakeX", "animate__rotateIn"];
var an = 0,
    expl = !1,
    gap = 2000,
    cards;
	
	function attachListeners(){
    cards = document.querySelectorAll('.button');
    $(cards).attr("tabindex", "0");
    var pauseTimeout;
    
    $(".button").off("click").on("click", function() {
        if (pauseTimeout) {
            clearTimeout(pauseTimeout);
            pauseTimeout = null;
        }
        
        $(this).addClass(anim[an]);
        var ind = parseInt($(this).attr('data'), 10);
        var item = audTime[ind];
        if (item === undefined) return;

        var start, end;
        if (typeof item === 'number') {
            start = item;
            end = audTime[ind + 1] !== undefined ? audTime[ind + 1] : start + (gap / 1000);
        } else {
            start = item.s !== undefined ? item.s : item.start;
            end = item.e !== undefined ? item.e : item.end;
        }

        if (start !== undefined && !isNaN(start)) {
            aud.pause();
            aud.currentTime = start;
        }
        
        aud.play();
        
        if (end !== undefined && !isNaN(end)) {
            pauseTimeout = setTimeout(function() {
                aud.pause();
            }, Math.max(0, (end - start) * 1000));
        } else {
            pauseTimeout = setTimeout(function() {
                aud.pause();
            }, gap);
        }

        $(this).addClass("clicked");
        this.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        if ($(".clicked").length == audTime.length && !expl) {
            explodeConfetti();
            expl = !0
        }
    });
}

$(document).ready(function() {

    $(".toggle-button").click(function() {
        if (!$(this).hasClass("play"))
            $(".toggle-button").removeClass("active");
        $(this).addClass("active")
    });
    
    var intv;
    var i = 0;
    
    $(".toggle-button.play").click(function(e) {
        if (!aud.paused)
            return;
        $(this).addClass("active");
        $(".button").removeClass(anim.join(" ")).removeClass("clicked");
        an = 0;
        i = 0;
        expl = !1;
        var bt = $(".button");
        if ($(this).hasClass("active") && $(this).html() == "Stop") {
            clearInterval(intv);
            $(".autoplay").removeClass("autoplay");
            $(this).removeClass("active");
            $(this).html("Play");
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
    if(!settings.confettiEnabled)
        return;
    confetti({
        particleCount: 30,
        spread: 100,
        origin: {
            y: .5
        }
    })
}
const scrollToTopBtn = document.getElementById("scrollToTopBtn");
window.onscroll = function() {
    if (scrollToTopBtn) {
        scrollFunction();
    }
};

function scrollFunction() {
    if (!scrollToTopBtn) return;
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollToTopBtn.style.display = "block"
    } else {
        scrollToTopBtn.style.display = "none"
    }
}

if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener("click", function() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0
    });
}
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
