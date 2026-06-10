import gsap from "gsap";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type GoogleReview = {
  rating?: number;
  publishTime?: string;
  authorAttribution?: { displayName?: string };
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
};

type GooglePlaceResponse = {
  rating?: number;
  userRatingCount?: number;
  reviews?: GoogleReview[];
};

const GOOGLE_REVIEWS_CONFIG = {
  PLACE_ID: "",
  API_KEY: "",
  MIN_RATING: 4,
  MAX_REVIEWS: 6,
  LANGUAGE: "fr",
};

const MOTION = {
  ctaScaleFrom: 0.92,
  ctaYFrom: 44,
  ctaTriggerStart: "top 96%",
  ctaTriggerEnd: "top 52%",
  ctaMobileTriggerStart: "top 115%",
  ctaMobileTriggerEnd: "top 78%",
  ctaScrub: 0.35,
  problemeSideXFrom: 96,
  problemeImageScaleFrom: 0.94,
  problemeImageBlurFrom: "18px",
  problemeImageScrub: 0.8,
  timelineScrub: 0.45,
  timelineRevealScaleFrom: 0.96,
  timelineRevealYFrom: 34,
  resultCounterDuration: 1.4,
};

const DESKTOP_SMOOTH_SCROLL_QUERY = "(min-width: 1024px) and (pointer: fine)";
const PROBLEME_HORIZONTAL_QUERY = "(min-width: 992px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function shouldUseSmoothScroll() {
  return window.matchMedia(DESKTOP_SMOOTH_SCROLL_QUERY).matches && !window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function setMobileMenuOpen(isOpen: boolean) {
  const burgerBtn = document.getElementById("burgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  burgerBtn?.classList.toggle("open", isOpen);
  mobileMenu?.classList.toggle("open", isOpen);
  burgerBtn?.setAttribute("aria-expanded", String(isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
}

function scrollToSection(target: Element, lenis?: Lenis | null) {
  const header = document.getElementById("header");
  const headerHeight = header ? header.offsetHeight : 80;
  const viewportHeight = window.innerHeight;
  const isMobile = window.innerWidth < 992;

  let scrollTarget: number;

  if (isMobile) {
    const anchor = target.querySelector(".section-tag, .section-title, h1, h2") ?? target;
    const anchorRect = anchor.getBoundingClientRect();
    const anchorTop = anchorRect.top + window.scrollY;
    scrollTarget = anchorTop - viewportHeight * 0.25;
  } else {
    const rect = target.getBoundingClientRect();
    const targetTop = rect.top + window.scrollY;
    scrollTarget = targetTop - headerHeight - (viewportHeight - headerHeight) * 0.15;
  }

  const top = Math.max(0, scrollTarget);
  if (lenis) {
    lenis.scrollTo(top, { duration: 1.1 });
    return;
  }

  window.scrollTo({ top, behavior: shouldUseSmoothScroll() ? "smooth" : "auto" });
}

function setupSlider(outer: HTMLElement, track: HTMLElement, pxPerSec: number) {
  let offset = 0;
  let lastTime: number | null = null;
  let isInteracting = false;
  let isHovering = false;
  let dragStartX = 0;
  let dragStartOffset = 0;
  let dragLastTime = 0;
  let dragVelocity = 0;
  let inertiaVelocity = 0;
  let frameId = 0;

  const getOneSet = () => track.scrollWidth / 3 || 0;

  const applyOffset = () => {
    const oneSet = getOneSet();
    if (oneSet > 0) offset = ((offset % oneSet) + oneSet) % oneSet;
    track.style.transform = `translateX(${-offset}px)`;
  };

  const tick = (now: number) => {
    if (lastTime === null) lastTime = now;
    const dt = Math.min(now - lastTime, 100);
    lastTime = now;

    if (!isInteracting && Math.abs(inertiaVelocity) > 0.02 && !document.hidden) {
      offset += inertiaVelocity * dt;
      inertiaVelocity *= Math.pow(0.92, dt / 16.67);
      applyOffset();
    } else if (!isInteracting && !isHovering && !document.hidden) {
      inertiaVelocity = 0;
      offset += (pxPerSec * dt) / 1000;
      applyOffset();
    }

    frameId = requestAnimationFrame(tick);
  };

  const dragStart = (clientX: number) => {
    isInteracting = true;
    inertiaVelocity = 0;
    dragVelocity = 0;
    dragStartX = clientX;
    dragLastTime = performance.now();
    dragStartOffset = offset;
  };

  const dragMove = (clientX: number) => {
    if (!isInteracting) return;
    const now = performance.now();
    const dt = Math.max(now - dragLastTime, 1);
    const previousOffset = offset;

    offset = dragStartOffset - (clientX - dragStartX);
    dragVelocity = (offset - previousOffset) / dt;
    dragLastTime = now;
    applyOffset();
  };

  const dragEnd = () => {
    if (isInteracting) {
      inertiaVelocity = Math.max(-1.8, Math.min(1.8, dragVelocity));
    }
    isInteracting = false;
    lastTime = null;
  };

  const onTouchStart = (event: TouchEvent) => dragStart(event.touches[0]?.clientX ?? 0);
  const onTouchMove = (event: TouchEvent) => dragMove(event.touches[0]?.clientX ?? 0);
  const onMouseDown = (event: MouseEvent) => {
    dragStart(event.clientX);
    event.preventDefault();
  };
  const onMouseMove = (event: MouseEvent) => {
    if (isInteracting) dragMove(event.clientX);
  };
  const onMouseEnter = () => {
    isHovering = true;
    lastTime = null;
  };
  const onMouseLeave = () => {
    isHovering = false;
    dragEnd();
  };

  outer.addEventListener("touchstart", onTouchStart, { passive: true });
  outer.addEventListener("touchmove", onTouchMove, { passive: true });
  outer.addEventListener("touchend", dragEnd);
  outer.addEventListener("touchcancel", dragEnd);
  outer.addEventListener("mousedown", onMouseDown);
  outer.addEventListener("mouseenter", onMouseEnter);
  outer.addEventListener("mouseleave", onMouseLeave);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", dragEnd);

  frameId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frameId);
    outer.removeEventListener("touchstart", onTouchStart);
    outer.removeEventListener("touchmove", onTouchMove);
    outer.removeEventListener("touchend", dragEnd);
    outer.removeEventListener("touchcancel", dragEnd);
    outer.removeEventListener("mousedown", onMouseDown);
    outer.removeEventListener("mouseenter", onMouseEnter);
    outer.removeEventListener("mouseleave", onMouseLeave);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", dragEnd);
  };
}

async function loadGoogleReviews() {
  const cfg = GOOGLE_REVIEWS_CONFIG;
  if (!cfg.PLACE_ID || !cfg.API_KEY) return;

  try {
    const response = await fetch(`https://places.googleapis.com/v1/places/${cfg.PLACE_ID}?languageCode=${cfg.LANGUAGE}`, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": cfg.API_KEY,
        "X-Goog-FieldMask": "reviews,rating,userRatingCount,displayName",
      },
    });

    if (!response.ok) throw new Error(`Status ${response.status}`);

    const data = (await response.json()) as GooglePlaceResponse;
    const reviews = (data.reviews ?? [])
      .filter((review) => (review.rating ?? 0) >= cfg.MIN_RATING)
      .sort((a, b) => new Date(b.publishTime ?? 0).getTime() - new Date(a.publishTime ?? 0).getTime())
      .slice(0, cfg.MAX_REVIEWS);

    if (reviews.length === 0) return;

    const bigScore = document.querySelector<HTMLElement>(".avis-big-score");
    const avisCount = document.querySelector<HTMLElement>(".avis-count");
    if (bigScore && data.rating) bigScore.textContent = data.rating.toFixed(1);
    if (avisCount && data.userRatingCount) avisCount.textContent = `${data.userRatingCount} avis Google`;

    const checkIcon =
      '<svg class="badge-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';
    const cardsHtml = reviews
      .map((review) => {
        const rating = review.rating ?? 0;
        const starIcon =
          '<svg class="rating-star-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.751a.53.53 0 0 1 .294.904l-3.736 3.644a2.123 2.123 0 0 0-.611 1.878l.882 5.145a.53.53 0 0 1-.77.559l-4.618-2.428a2.122 2.122 0 0 0-1.973 0l-4.618 2.428a.53.53 0 0 1-.77-.56l.882-5.144a2.123 2.123 0 0 0-.611-1.878L2.16 9.79a.53.53 0 0 1 .294-.904l5.165-.751a2.123 2.123 0 0 0 1.596-1.16z"/></svg>';
        const stars = Array.from({ length: rating }, () => starIcon).join("");
        const author = review.authorAttribution?.displayName || "Client Google";
        const initials = author
          .split(" ")
          .map((word) => word[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        const text = (review.text?.text || review.originalText?.text || "").slice(0, 240);
        const date = review.relativePublishTimeDescription || "";

        return `<div class="avis-card"><div class="avis-top"><div class="avis-avatar">${initials}</div><div><div class="avis-name">${author}</div><div class="avis-stars-sm">${stars}</div>${date ? `<div class="avis-date">${date}</div>` : ""}</div></div><p class="avis-text">${text}</p><div class="avis-verified">${checkIcon} Avis Google vérifié</div></div>`;
      })
      .join("");

    document.querySelectorAll<HTMLElement>(".avis-marquee-track").forEach((track) => {
      track.innerHTML = cardsHtml + cardsHtml + cardsHtml;
    });

    const badge = document.querySelector<HTMLElement>(".avis-google-badge");
    if (badge) badge.innerHTML = `${checkIcon} Avis Google vérifiés`;
  } catch {
    // Les placeholders restent en place si l'intégration Google n'est pas disponible.
  }
}

function setupLandingAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return gsap.context(() => undefined);
  }

  return gsap.context((context) => {
    const select = context.selector;
    if (!select) return;

    const ctaBands = [...select(".cta-band"), ...select("#cta-band-2")];
    gsap.set(ctaBands, { transformOrigin: "center center" });

    ctaBands.forEach((ctaBand) => {
      gsap.fromTo(
        ctaBand,
        {
          y: MOTION.ctaYFrom,
          scale: MOTION.ctaScaleFrom,
          boxShadow: "0 8px 22px rgba(80,32,184,.06)",
        },
        {
          y: 0,
          scale: 1,
          boxShadow: "0 28px 70px rgba(80,32,184,.26)",
          ease: "none",
          scrollTrigger: {
            trigger: ctaBand,
            start: () => (window.matchMedia("(max-width: 991px)").matches ? MOTION.ctaMobileTriggerStart : MOTION.ctaTriggerStart),
            end: () => (window.matchMedia("(max-width: 991px)").matches ? MOTION.ctaMobileTriggerEnd : MOTION.ctaTriggerEnd),
            scrub: MOTION.ctaScrub,
            invalidateOnRefresh: true,
          },
        },
      );
    });



    const finalCtaButton = select(".btn-cta-final")[0] as HTMLElement | undefined;
    if (finalCtaButton) {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: finalCtaButton,
            start: "top 85%",
            once: true,
          },
        })
        .fromTo(
          finalCtaButton,
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1.12, duration: 0.24, ease: "power2.out" },
        )
        .to(finalCtaButton, { scale: 0.95, duration: 0.16, ease: "power2.inOut" })
        .to(finalCtaButton, { scale: 1.06, duration: 0.16, ease: "power2.out" })
        .to(finalCtaButton, { scale: 0.98, duration: 0.14, ease: "power2.inOut" })
        .to(finalCtaButton, { scale: 1.02, duration: 0.12, ease: "power2.out" })
        .to(finalCtaButton, { scale: 1, duration: 0.14, ease: "power2.out", clearProps: "transform,willChange" });
    }

    const faqSection = select("#faq")[0] as HTMLElement | undefined;
    const faqHeading = select("#faq .faq-heading")[0] as HTMLElement | undefined;
    const faqItems = select("#faq .faq-item") as HTMLElement[];
    if (faqSection && faqItems.length > 0) {
      const faqTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: faqSection,
          start: "top 82%",
          once: true,
        },
      });

      if (faqHeading) {
        faqTimeline.fromTo(
          faqHeading,
          { autoAlpha: 0, y: 36 },
          { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", clearProps: "transform,opacity,visibility" },
        );
      }

      faqTimeline.fromTo(
        faqItems,
        { autoAlpha: 0, y: 44, scale: 0.975 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.72,
          ease: "power3.out",
          stagger: 0.14,
          clearProps: "transform,opacity,visibility",
        },
        faqHeading ? "-=0.18" : 0,
      );
    }

    const heroChecklistItems = select(".hero-check-item");
    const heroChecklist = select(".hero-checklist")[0];
    if (heroChecklistItems.length && heroChecklist && window.matchMedia("(max-width: 991px)").matches) {
      gsap.set(heroChecklistItems, {
        autoAlpha: 0,
        scale: 0.88,
        transformOrigin: "left center",
      });

      gsap.to(heroChecklistItems, {
        autoAlpha: 1,
        scale: 1,
        duration: 0.55,
        ease: "back.out(1.8)",
        stagger: 0.15,
        scrollTrigger: {
          trigger: heroChecklist,
          start: "top 88%",
          once: true,
        },
      });
    }

    const problemeSection = select("#probleme")[0] as HTMLElement | undefined;
    const problemeFlow = select(".probleme-flow")[0] as HTMLElement | undefined;
    const problemeCases = select(".probleme-case") as HTMLElement[];
    const isProblemeDesktop = window.matchMedia(PROBLEME_HORIZONTAL_QUERY).matches;

    if (isProblemeDesktop && problemeSection && problemeFlow && problemeCases.length > 1) {
      const getInitialOffset = () => Math.max(0, (window.innerWidth - problemeCases[0].offsetWidth) / 2);
      const getFinalOffset = () => Math.max(0, (window.innerWidth - problemeCases[problemeCases.length - 1].offsetWidth) / 2);
      const getHorizontalDistance = () =>
        Math.max(
          0,
          getInitialOffset() + problemeFlow.scrollWidth - problemeCases[problemeCases.length - 1].offsetWidth - getFinalOffset(),
        );
      const updateProblemeSlides = () => {
        const viewportCenter = window.innerWidth / 2;
        const fadeStart = window.innerWidth * 0.12;
        const fadeEnd = window.innerWidth * 0.36;

        problemeCases.forEach((slide) => {
          const rect = slide.getBoundingClientRect();
          const slideCenter = rect.left + rect.width / 2;
          const distanceFromCenter = Math.abs(slideCenter - viewportCenter);
          const centerOpacity = gsap.utils.clamp(0, 1, 1 - (distanceFromCenter - fadeStart) / (fadeEnd - fadeStart));
          const leftExitOpacity =
            rect.left < 0 ? gsap.utils.clamp(0, 1, 1 + rect.left / (window.innerWidth * 0.14)) : 1;
          const rightEntryOpacity =
            rect.right > window.innerWidth
              ? gsap.utils.clamp(0, 1, 1 - (rect.right - window.innerWidth) / (window.innerWidth * 0.22))
              : 1;
          const opacity = Math.min(centerOpacity, leftExitOpacity, rightEntryOpacity);

          gsap.set(slide, { autoAlpha: opacity });
        });
      };

      problemeSection.classList.add("probleme-horizontal-ready");
      context.add(() => {
        return () => {
          problemeSection.classList.remove("probleme-horizontal-ready");
          gsap.set(problemeFlow, { clearProps: "transform,willChange" });
          gsap.set(problemeCases, { clearProps: "opacity,visibility" });
        };
      });

      gsap.set(problemeFlow, {
        x: () => getInitialOffset(),
        willChange: "transform",
      });
      gsap.set(problemeCases, { autoAlpha: 1 });

      gsap.to(problemeFlow, {
        x: () => getInitialOffset() - getHorizontalDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: problemeSection,
          start: "top top",
          end: () => `+=${getHorizontalDistance() * 0.68}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          refreshPriority: 2,
          invalidateOnRefresh: true,
          onUpdate: () => updateProblemeSlides(),
          onRefresh: () => updateProblemeSlides(),
        },
      });
    } else {
      problemeCases.forEach((section) => {
        const image = section.querySelector(".probleme-image-wrap");
        const copy = section.querySelector(".probleme-copy");
        const isReverse = section.classList.contains("probleme-case--reverse");
        const imageXFrom = isReverse ? MOTION.problemeSideXFrom : -MOTION.problemeSideXFrom;
        const copyXFrom = isReverse ? -MOTION.problemeSideXFrom : MOTION.problemeSideXFrom;

        if (image) {
          gsap.fromTo(
            image,
            {
              autoAlpha: 0,
              x: imageXFrom,
              scale: MOTION.problemeImageScaleFrom,
              filter: `blur(${MOTION.problemeImageBlurFrom})`,
            },
            {
              autoAlpha: 1,
              x: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 72%",
                end: "top 28%",
                scrub: MOTION.problemeImageScrub,
              },
            },
          );
        }

        if (copy) {
          gsap.fromTo(
            copy,
            {
              autoAlpha: 0,
              x: copyXFrom,
              scale: 0.98,
            },
            {
              autoAlpha: 1,
              x: 0,
              scale: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 72%",
                end: "top 34%",
                scrub: MOTION.problemeImageScrub,
              },
            },
          );
        }
      });
    }

    const uspSection = select("#usp")[0] as HTMLElement | undefined;
    const uspWindow = select("#usp .usp-cards-window")[0] as HTMLElement | undefined;
    const uspTrack = select("#usp .usp-grid")[0] as HTMLElement | undefined;
    const uspCards = select("#usp .usp-card") as HTMLElement[];
    const uspMiniLock = select("#usp .usp-mini-lock")[0] as HTMLElement | undefined;
    const uspMiniLockTrace = select("#usp .usp-mini-lock-trace")[0] as HTMLElement | undefined;
    const uspMiniLockSvg = select("#usp .usp-mini-lock-svg")[0] as SVGSVGElement | undefined;
    const uspMiniLockShackle = select("#usp .usp-mini-lock-shackle")[0] as SVGPathElement | undefined;
    const isUspDesktop = window.matchMedia("(min-width: 992px)").matches;

    if (isUspDesktop && uspSection && uspWindow && uspTrack && uspCards.length > 1) {
      const getUspWindowMetrics = () => {
        const rect = uspWindow.getBoundingClientRect();

        return {
          visibleHeight: Math.max(1, uspWindow.clientHeight),
          center: rect.top + rect.height / 2,
        };
      };
      const setUspTrackPadding = () => {
        const cardHeight = uspCards[0]?.offsetHeight ?? 0;
        const { visibleHeight } = getUspWindowMetrics();
        const verticalPadding = Math.max(0, (visibleHeight - cardHeight) / 2);
        gsap.set(uspTrack, { paddingTop: verticalPadding, paddingBottom: verticalPadding });
      };
      const getUspDistance = () => Math.max(0, uspTrack.scrollHeight - uspWindow.clientHeight);
      const getUspScrollLength = () => Math.max(getUspDistance() * 1.25, window.innerHeight * 0.85);
      const updateUspFocus = () => {
        const { center: windowCenter } = getUspWindowMetrics();

        uspCards.forEach((card) => {
          const cardRect = card.getBoundingClientRect();
          const cardCenter = cardRect.top + cardRect.height / 2;
          const distance = Math.abs(windowCenter - cardCenter);
          const centerHold = cardRect.height * 0.55;
          const fadeDistance = cardRect.height * 1.9;
          const fadeProgress = Math.max(0, distance - centerHold) / Math.max(1, fadeDistance - centerHold);
          const opacity = Math.max(0, Math.min(1, 1 - fadeProgress));

          gsap.set(card, {
            autoAlpha: opacity,
          });
        });
      };
      const updateUspMiniLock = (progress: number) => {
        const clampedProgress = Math.max(0, Math.min(1, progress));
        if (uspMiniLock && uspMiniLockSvg) {
          const travel = Math.max(0, uspMiniLock.clientWidth - uspMiniLockSvg.clientWidth - 12);
          const lockX = travel * clampedProgress;
          if (uspMiniLockTrace) {
            gsap.set(uspMiniLockTrace, {
              width: Math.max(0, lockX - 22),
            });
          }
          gsap.set(uspMiniLockSvg, {
            x: lockX,
          });
        }
        if (!uspMiniLockShackle) return;
        const unlockProgress = Math.max(0, Math.min(1, (progress - 0.12) / 0.7));
        const liftProgress = Math.min(1, unlockProgress / 0.42);
        const pivotProgress = Math.max(0, Math.min(1, (unlockProgress - 0.42) / 0.58));

        gsap.set(uspMiniLockShackle, {
          rotate: 25 * pivotProgress,
          x: 0,
          y: -2.8 * liftProgress,
          svgOrigin: "23 18.5",
        });
      };
      uspSection.classList.add("usp-scroll-ready");
      context.add(() => {
        return () => {
          uspSection.classList.remove("usp-scroll-ready");
          gsap.set(uspTrack, { clearProps: "transform,willChange,paddingTop,paddingBottom" });
          gsap.set(uspCards, { clearProps: "opacity,visibility" });
          if (uspMiniLockTrace) gsap.set(uspMiniLockTrace, { clearProps: "width" });
          if (uspMiniLockSvg) gsap.set(uspMiniLockSvg, { clearProps: "transform" });
          if (uspMiniLockShackle) gsap.set(uspMiniLockShackle, { clearProps: "transform" });
        };
      });

      setUspTrackPadding();
      gsap.set(uspTrack, { y: 0, willChange: "transform" });
      if (uspMiniLockTrace) gsap.set(uspMiniLockTrace, { width: 0 });
      if (uspMiniLockSvg) gsap.set(uspMiniLockSvg, { x: 0 });
      if (uspMiniLockShackle) gsap.set(uspMiniLockShackle, { rotate: 0, x: 0, y: 0, svgOrigin: "23 18.5" });
      updateUspFocus();
      updateUspMiniLock(0);

      gsap.to(uspTrack, {
        y: () => -getUspDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: uspSection,
          start: "top top",
          end: () => `+=${getUspScrollLength()}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          refreshPriority: 1,
          invalidateOnRefresh: true,
          onRefreshInit: setUspTrackPadding,
          onRefresh: (self) => {
            setUspTrackPadding();
            updateUspFocus();
            updateUspMiniLock(self.progress);
          },
          onUpdate: (self) => {
            updateUspFocus();
            updateUspMiniLock(self.progress);
          },
        },
      });
    }

    const timeline = select(".timeline-steps")[0];
    const timelineLine = timeline?.querySelector(".timeline-line");
    const timelineProgress = timeline?.querySelector(".timeline-progress");
    const timelineSteps = select(".timeline-step") as HTMLElement[];

    if (timeline && timelineLine && timelineProgress) {
      const updateTimelineSteps = (progress: number) => {
        const lineRect = timelineLine.getBoundingClientRect();
        const reachedY = lineRect.top + lineRect.height * progress;

        timelineSteps.forEach((step) => {
          const dot = step.querySelector(".step-num");
          if (!dot) return;

          const dotRect = dot.getBoundingClientRect();
          const dotActivationY = dotRect.top + dotRect.height / 2;
          const dotDeactivationY = dotRect.top - 8;
          const isActive = step.classList.contains("is-active")
            ? reachedY >= dotDeactivationY
            : reachedY >= dotActivationY;

          step.classList.toggle("is-active", isActive);
        });
      };

      gsap.fromTo(
        timelineProgress,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: timeline,
            start: "top 62%",
            end: "bottom 55%",
            scrub: MOTION.timelineScrub,
          },
        },
      );

      ScrollTrigger.create({
        trigger: timeline,
        start: "top 62%",
        end: "bottom 55%",
        onUpdate: (self) => updateTimelineSteps(self.progress),
        onRefresh: (self) => updateTimelineSteps(self.progress),
      });
    }

    timelineSteps.forEach((step) => {
      const media = step.querySelector(".step-img-wrap");
      const copy = step.querySelector(".step-card-body");
      const revealTargets = [media, copy].filter(Boolean);

      if (!revealTargets.length) return;

      gsap.fromTo(
        revealTargets,
        {
          autoAlpha: 0,
          y: MOTION.timelineRevealYFrom,
          scale: MOTION.timelineRevealScaleFrom,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: step,
            start: "top 72%",
            end: "top 42%",
            scrub: 0.35,
          },
        },
      );
    });

    const resultNumbers = select("#resultats .resultat-num");

    if (resultNumbers.length >= 3) {
      const counters = [
        { element: resultNumbers[0], from: 0, to: 30, format: (value: number) => `${value}'` },
        { element: resultNumbers[1], from: 0, to: 24, format: (value: number) => `${value}/7` },
        { element: resultNumbers[2], from: 100, to: 0, format: (value: number) => `${value}€` },
      ];

      ScrollTrigger.create({
        trigger: "#resultats",
        start: "top 72%",
        once: true,
        onEnter: () => {
          counters.forEach(({ element, from, to, format }, index) => {
            const state = { value: from };
            element.textContent = format(from);

            gsap.to(state, {
              value: to,
              duration: MOTION.resultCounterDuration,
              delay: index * 0.12,
              ease: "power3.out",
              snap: { value: 1 },
              onUpdate: () => {
                element.textContent = format(state.value);
              },
            });
          });
        },
      });
    }

  }, document.body);
}


function setupFaqInteractions() {
  const section = document.getElementById("faq");
  if (!section) return () => undefined;

  const items = Array.from(section.querySelectorAll<HTMLElement>(".faq-item"));
  const buttons = Array.from(section.querySelectorAll<HTMLButtonElement>(".faq-question"));
  if (!items.length || !buttons.length) return () => undefined;

  let openIndex = items.findIndex((item) => item.dataset.open === "true");
  if (openIndex < 0) openIndex = 0;

  const setOpenIndex = (nextIndex: number) => {
    openIndex = nextIndex;
    items.forEach((item, index) => {
      const isOpen = index === openIndex;
      const answer = item.querySelector<HTMLElement>(".faq-answer");
      const button = buttons[index];

      item.dataset.open = String(isOpen);
      button?.setAttribute("aria-expanded", String(isOpen));
      answer?.setAttribute("aria-hidden", String(!isOpen));
    });
  };

  const focusQuestion = (index: number) => {
    const safeIndex = (index + buttons.length) % buttons.length;
    buttons[safeIndex]?.focus();
  };

  const listeners: Array<() => void> = [];

  buttons.forEach((button, index) => {
    const onClick = () => setOpenIndex(openIndex === index ? -1 : index);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusQuestion(index + 1);
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        focusQuestion(index - 1);
      }

      if (event.key === "Home") {
        event.preventDefault();
        focusQuestion(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        focusQuestion(buttons.length - 1);
      }
    };

    button.addEventListener("click", onClick);
    button.addEventListener("keydown", onKeyDown);
    listeners.push(() => {
      button.removeEventListener("click", onClick);
      button.removeEventListener("keydown", onKeyDown);
    });
  });

  setOpenIndex(openIndex);

  return () => listeners.forEach((cleanup) => cleanup());
}

function initLanding() {
  if (document.documentElement.dataset.landingInitialized === "true") return undefined;
  document.documentElement.dataset.landingInitialized = "true";

    const sliderCleanups: Array<() => void> = [];
    let slidersInitialized = false;
    const desktopSmoothScrollMedia = window.matchMedia(DESKTOP_SMOOTH_SCROLL_QUERY);
    const reducedMotionMedia = window.matchMedia(REDUCED_MOTION_QUERY);
    const prefersReducedMotion = reducedMotionMedia.matches;
    let lenis: Lenis | null = null;
    let lenisFrame = 0;
    let removeLenisScrollListener: (() => void) | null = null;

    const faqCleanup = setupFaqInteractions();
    const animationContext = setupLandingAnimations();

    const revealElements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    let observer: IntersectionObserver | null = null;

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, index) => {
            if (!entry.isIntersecting) return;
            window.setTimeout(() => entry.target.classList.add("visible"), index * 80);
            observer?.unobserve(entry.target);
          });
        },
        { threshold: 0.1 },
      );
    }

    if (observer) revealElements.forEach((element) => observer.observe(element));
    else revealElements.forEach((element) => element.classList.add("visible"));

    const burgerBtn = document.getElementById("burgerBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    const heroSection = document.getElementById("hero");
    const backToTopButtons = document.querySelectorAll<HTMLElement>(".back-to-top");
    const updateBackToTopVisibility = () => {
      if (!heroSection || !backToTopButtons.length) return;
      const shouldShow = window.scrollY > heroSection.offsetTop + heroSection.offsetHeight - 1;
      backToTopButtons.forEach((button) => button.classList.toggle("visible", shouldShow));
    };

    const stopLenis = () => {
      removeLenisScrollListener?.();
      removeLenisScrollListener = null;
      if (lenisFrame) window.cancelAnimationFrame(lenisFrame);
      lenisFrame = 0;
      lenis?.destroy();
      lenis = null;
    };

    const startLenis = () => {
      if (lenis || !shouldUseSmoothScroll()) return;

      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        smoothWheel: true,
        syncTouch: true,
        touchInertiaExponent: 1.35,
      });

      removeLenisScrollListener = lenis.on("scroll", () => {
        ScrollTrigger.update();
        updateBackToTopVisibility();
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        lenisFrame = window.requestAnimationFrame(raf);
      };

      lenisFrame = window.requestAnimationFrame(raf);
    };

    const updateSmoothScrollMode = () => {
      if (shouldUseSmoothScroll()) startLenis();
      else stopLenis();
    };

    updateSmoothScrollMode();
    desktopSmoothScrollMedia.addEventListener("change", updateSmoothScrollMode);
    reducedMotionMedia.addEventListener("change", updateSmoothScrollMode);

    const onBurgerClick = () => setMobileMenuOpen(!mobileMenu?.classList.contains("open"));
    const onOverlayClick = (event: MouseEvent) => {
      if (event.target === mobileMenu) setMobileMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    burgerBtn?.addEventListener("click", onBurgerClick);
    mobileMenu?.addEventListener("click", onOverlayClick);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
    window.addEventListener("resize", updateBackToTopVisibility);
    updateBackToTopVisibility();

    const initSliders = () => {
      if (prefersReducedMotion) return;
      if (slidersInitialized) return;
      slidersInitialized = true;

      document.querySelectorAll<HTMLElement>(".avis-marquee-outer").forEach((outer) => {
        const track = outer.querySelector<HTMLElement>(".avis-marquee-track");
        if (track) sliderCleanups.push(setupSlider(outer, track, 35));
      });

      document.querySelectorAll<HTMLElement>(".marquee-outer").forEach((outer) => {
        const track = outer.querySelector<HTMLElement>(".marquee-track");
        if (track) sliderCleanups.push(setupSlider(outer, track, 50));
      });
    };

    if (document.readyState === "complete") initSliders();
    else window.addEventListener("load", initSliders, { once: true });

    const refreshScrollTriggers = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") window.requestAnimationFrame(refreshScrollTriggers);
    else window.addEventListener("load", refreshScrollTriggers, { once: true });

    const onAnchorClick = (event: MouseEvent) => {
      const targetElement = event.target instanceof Element ? event.target : null;
      const link = targetElement?.closest<HTMLAnchorElement>('a[href^="#"]');
      const href = link?.getAttribute("href");
      if (!href || href === "#" || href.length < 2) return;

      const target = document.querySelector(href);
      if (!target) return;

      event.preventDefault();
      scrollToSection(target, lenis);
      setMobileMenuOpen(false);
      history.replaceState(null, "", href);
    };

    document.addEventListener("click", onAnchorClick);

    const hashTimer = window.setTimeout(() => {
      if (window.location.hash && window.location.hash.length > 1) {
        const target = document.querySelector(window.location.hash);
        if (target) scrollToSection(target, lenis);
      }
    }, 100);

    void loadGoogleReviews();

    return () => {
      animationContext.revert();
      faqCleanup();
      delete document.documentElement.dataset.landingInitialized;
      observer?.disconnect();
      burgerBtn?.removeEventListener("click", onBurgerClick);
      mobileMenu?.removeEventListener("click", onOverlayClick);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", updateBackToTopVisibility);
      window.removeEventListener("resize", updateBackToTopVisibility);
      window.removeEventListener("load", initSliders);
      window.removeEventListener("load", refreshScrollTriggers);
      document.removeEventListener("click", onAnchorClick);
      desktopSmoothScrollMedia.removeEventListener("change", updateSmoothScrollMode);
      reducedMotionMedia.removeEventListener("change", updateSmoothScrollMode);
      window.clearTimeout(hashTimer);
      stopLenis();
      sliderCleanups.forEach((cleanup) => cleanup());
      document.body.style.overflow = "";
    };
}

let cleanupLanding: (() => void) | undefined;

const runLanding = () => {
  cleanupLanding?.();
  cleanupLanding = initLanding();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runLanding, { once: true });
} else {
  runLanding();
}

document.addEventListener("astro:before-swap", () => {
  cleanupLanding?.();
  cleanupLanding = undefined;
});
