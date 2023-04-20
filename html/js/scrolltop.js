const scrollToTopButton = document.getElementById('scroll-top-link');
		scrollToTopButton.addEventListener('click', (e) => {
			e.preventDefault();
			const initialPosition = window.pageYOffset;
			const targetPosition = 0;
			const distance = targetPosition - initialPosition;
			const duration = 500;
			let start = null;
			function scrollAnimation(timestamp) {
				if (!start) start = timestamp;
				const progress = timestamp - start;
				window.scrollTo(0, easeInOutCubic(progress, initialPosition, distance, duration));
				if (progress < duration) window.requestAnimationFrame(scrollAnimation);
			}
			function easeInOutCubic(t, b, c, d) {
				t /= d / 2;
				if (t < 1) return c / 2 * t * t * t + b;
				t -= 2;
				return c / 2 * (t * t * t + 2) + b;
			}
			window.requestAnimationFrame(scrollAnimation);
		});