document.addEventListener('DOMContentLoaded', function() {

    // --- Preloader ---
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        if (preloader) {
            setTimeout(() => {
                document.body.classList.add('loaded');
            }, 300); // Pequeno delay para garantir que tudo carregou visualmente
        }
    });
    // Fallback caso o evento 'load' demore muito ou falhe
    setTimeout(() => {
         if (preloader && !document.body.classList.contains('loaded')) {
             document.body.classList.add('loaded');
             console.warn("Preloader removido por timeout.");
         }
    }, 5000); // Remove após 5 segundos de qualquer maneira
    // --- Fim Preloader ---


    // --- Seletores Globais ---
    const progressBar = document.getElementById('progress-bar');
    const flowers = document.querySelectorAll('.flower');
    // Seleciona todos os elementos com .animate-me, EXCETO aqueles dentro de .letter-section ou #countdown-section que podem ter lógica de animação própria/diferente
    const animatedElements = document.querySelectorAll('.animate-me:not(.letter-section):not(#countdown-section):not(.countdown-event-note)');
    const letterSection = document.querySelector('.letter-section.animate-me');
    const signature = document.querySelector('.signature.animate-signature');
    const hiddenMessageTrigger = document.getElementById('hidden-message-trigger');
    const hiddenMessageModal = document.getElementById('hidden-message-modal');
    const modalClose = hiddenMessageModal ? hiddenMessageModal.querySelector('.modal-close') : null;
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');
    const music = document.getElementById('background-music');
    const musicToggle = document.getElementById('music-toggle');
    let musicPlayed = false;


    // --- Animação de Entrada com Intersection Observer (Elementos Gerais) ---
    if (animatedElements.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.20 // 20% do elemento visível para ativar
        };
        const observer = new IntersectionObserver((entries, obs) => { // Renomeado 'observer' para 'obs' para evitar conflito de escopo
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target); // Usa 'obs' aqui
                }
            });
        }, observerOptions);

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    // --- Observer Dedicado para a Carta (e trigger da assinatura) ---
    if (letterSection) {
        const letterObserverOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        const letterObserver = new IntersectionObserver((entries, obs) => { // Renomeado 'observer' para 'obs'
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    if (signature) {
                         setTimeout(() => {
                             signature.classList.add('writing');
                         }, 2000);
                    }
                    obs.unobserve(entry.target); // Usa 'obs'
                }
            });
        }, letterObserverOptions);
        letterObserver.observe(letterSection);
    }

    // --- Observer Dedicado para a Seção de Contagem Regressiva e sua nota ---
    // (Se você quiser que o #countdown-section e .countdown-event-note usem a mesma lógica de .animate-me)
    const countdownSectionForAnimation = document.getElementById('countdown-section');
    const countdownNoteForAnimation = document.querySelector('.countdown-event-note.animate-me');

    if (countdownSectionForAnimation && countdownSectionForAnimation.classList.contains('animate-me')) {
        const countdownObserverOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
        const countdownObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, countdownObserverOptions);
        countdownObserver.observe(countdownSectionForAnimation);
        if (countdownNoteForAnimation) { // Observa a nota separadamente se ela tiver .animate-me
            countdownObserver.observe(countdownNoteForAnimation);
        }
    }
    // --- Fim Animação de Entrada ---


    // --- EFEITOS SUTIS NA ROLAGEM (Flores + Barra de Progresso) ---
    function handleScrollEffects() {
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollableHeight <= 0) {
             if(progressBar) progressBar.style.width = (window.scrollY > 0 ? '100%' : '0%');
             flowers.forEach(flower => { flower.style.opacity = 0.15; });
            return;
          }

        const scrollY = window.scrollY;
        const scrollPercent = scrollY / scrollableHeight;
        const scrollPercentCSS = (scrollPercent * 100).toFixed(2);

        if(progressBar) {
            progressBar.style.width = `${scrollPercentCSS}%`;
        }

        flowers.forEach(flower => {
            const targetOpacity = Math.sin(scrollPercent * Math.PI) * 0.25 + 0.05;
            flower.style.opacity = targetOpacity.toFixed(2);
        });
    }

    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) { window.cancelAnimationFrame(scrollTimeout); }
        scrollTimeout = window.requestAnimationFrame(handleScrollEffects);
    }, { passive: true });
    handleScrollEffects();
    // --- FIM EFEITOS DE ROLAGEM ---


    // --- Interação de Clique (Emoji Popup em Mídias) ---
    const mediaClickTargets = document.querySelectorAll('.media-container');
    mediaClickTargets.forEach(container => {
         container.addEventListener('click', function(event) {
             const clickedElement = event.target;

             if ((clickedElement.tagName === 'VIDEO' && event.offsetY > clickedElement.offsetHeight - 40) ||
                 clickedElement.classList.contains('lightbox-trigger') ||
                 clickedElement.id === 'hidden-message-trigger' ||
                 clickedElement.closest('#hidden-message-trigger')) {
                 return;
             }

             const emoji = document.createElement('span');
             emoji.classList.add('popup-emoji');
             emoji.textContent = '💖';
             const rect = container.getBoundingClientRect();
             const bodyRect = document.body.getBoundingClientRect();
             const emojiSize = 60;
             const topPos = rect.top - bodyRect.top + (rect.height / 2) - (emojiSize / 2);
             const leftPos = rect.left - bodyRect.left + (rect.width / 2) - (emojiSize / 2);
             emoji.style.top = `${topPos}px`;
             emoji.style.left = `${leftPos}px`;
             document.body.appendChild(emoji);

             emoji.addEventListener('animationend', () => {
                 if (emoji.parentNode) emoji.parentNode.removeChild(emoji);
             });
             setTimeout(() => {
                 if (emoji.parentNode) emoji.parentNode.removeChild(emoji);
             }, 1200);
         });
    });
    // --- Fim Emoji Popup ---


    // --- Lightbox para Imagens ---
    if (lightboxOverlay && lightboxImage && lightboxClose && lightboxTriggers.length > 0) {
        lightboxTriggers.forEach(trigger => {
            if (trigger.tagName === 'IMG' && trigger.classList.contains('lightbox-trigger')) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const imgSrc = trigger.getAttribute('src');
                    if (imgSrc) {
                        lightboxImage.setAttribute('src', imgSrc);
                        lightboxOverlay.classList.add('active');
                        document.body.style.overflow = 'hidden';
                    }
                });
            }
        });

        const closeLightbox = () => {
            lightboxOverlay.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => { lightboxImage.setAttribute('src', ''); }, 300);
        };

        lightboxClose.addEventListener('click', closeLightbox);
        lightboxOverlay.addEventListener('click', (e) => {
            if (e.target === lightboxOverlay) closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightboxOverlay.classList.contains('active')) {
                closeLightbox();
            }
        });
    } else {
        console.warn("Elementos do Lightbox não encontrados ou nenhuma imagem configurada com 'lightbox-trigger'.");
    }
    // --- Fim Lightbox ---


    // --- Mensagem Secreta (Modal do Envelope) ---
    if (hiddenMessageTrigger && hiddenMessageModal && modalClose) {
        hiddenMessageTrigger.addEventListener('click', () => {
            hiddenMessageModal.classList.add('active');
        });
        const closeModal = () => { hiddenMessageModal.classList.remove('active'); };
        modalClose.addEventListener('click', closeModal);
        hiddenMessageModal.addEventListener('click', (e) => { if (e.target === hiddenMessageModal) closeModal(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && hiddenMessageModal.classList.contains('active')) closeModal(); });
    } else {
        console.warn("Elementos da Mensagem Secreta (trigger, modal ou botão de fechar) não encontrados.");
        if(hiddenMessageTrigger) hiddenMessageTrigger.style.display = 'none';
    }
    // --- Fim Mensagem Secreta ---


    // --- Controle da Música de Fundo ---
    if (music && musicToggle) {
        function playMusicOnInteraction() {
            if (!musicPlayed && music.paused) {
                music.play().then(() => {
                    musicPlayed = true;
                    cleanupInteractionListeners();
                }).catch(error => {
                    console.warn("Autoplay da música bloqueado. Use o botão de música ou interaja novamente.", error);
                });
            } else if (!music.paused) {
                cleanupInteractionListeners();
            }
        }
        function cleanupInteractionListeners() {
            document.removeEventListener('click', playMusicOnInteraction);
            document.removeEventListener('keydown', playMusicOnInteraction);
        }
        document.addEventListener('click', playMusicOnInteraction, { once: false });
        document.addEventListener('keydown', playMusicOnInteraction, { once: false });

        musicToggle.addEventListener('click', () => {
            cleanupInteractionListeners();
            if (music.paused) {
                music.play().catch(error => { console.error("Erro ao tocar música pelo botão:", error); musicToggle.textContent = 'Erro'; });
            } else { music.pause(); }
        });
        music.onpause = () => { musicToggle.classList.remove('playing'); musicToggle.textContent = 'Música'; };
        music.onplay = () => { musicPlayed = true; musicToggle.classList.add('playing'); musicToggle.textContent = 'Pausar'; };
    } else {
        console.warn("Elemento de áudio (#background-music) ou botão (#music-toggle) não encontrado.");
        if(musicToggle) musicToggle.style.display = 'none';
    }
    // --- Fim Controle Música ---

    // --- Contagem Regressiva ---
    function startCountdown() {
        // Data do evento: 10 de Maio de 2025, às 20:00 (horário local do navegador)
        // Formato "Month Day, YYYY HH:MM:SS" é geralmente bem suportado
        const countdownDate = new Date("May 10, 2025 20:00:00").getTime();

        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        const countdownMessageEl = document.getElementById('countdown-message');
        const countdownTimerEl = document.getElementById('countdown-timer');
        const countdownEventNote = document.querySelector('.countdown-event-note');

        // Verifica se todos os elementos essenciais do timer existem
        if (!daysEl || !hoursEl || !minutesEl || !secondsEl || !countdownMessageEl || !countdownTimerEl) {
            if (document.getElementById('countdown-section')) { // Só emite aviso se a seção existir, mas os elementos internos não
                 console.warn("Elementos internos da contagem regressiva não encontrados, mas a seção #countdown-section existe.");
            }
            return; // Não inicia o contador se elementos cruciais faltarem
        }

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = countdownDate - now;

            if (distance < 0) {
                clearInterval(interval);
                countdownTimerEl.style.display = 'none'; // Esconde os blocos de tempo
                countdownMessageEl.textContent = "Chegou o nosso momento, meu amor! ❤️";
                if (countdownEventNote) { // Esconde a nota do evento também
                    countdownEventNote.style.display = 'none';
                }
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            daysEl.textContent = String(days).padStart(2, '0');
            hoursEl.textContent = String(hours).padStart(2, '0');
            minutesEl.textContent = String(minutes).padStart(2, '0');
            secondsEl.textContent = String(seconds).padStart(2, '0');

        }, 1000);
    }

    // Inicia a contagem regressiva apenas se a seção existir na página
    if (document.getElementById('countdown-section')) {
        startCountdown();
    }
    // --- Fim Contagem Regressiva ---


    console.log("Página romântica (JS Completo com Contagem) carregada!");

}); // Fim do addEventListener DOMContentLoaded