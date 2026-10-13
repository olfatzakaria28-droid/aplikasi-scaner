document.addEventListener("DOMContentLoaded", () => {
    const resultBox = document.getElementById("result-box");
    const resultText = document.getElementById("result-text");
    const copyBtn = document.getElementById("copy-btn");
    const openLinkBtn = document.getElementById("open-link-btn");

    let audioCtx = null;

    // Menyiapkan / mengaktifkan AudioContext dari interaksi pengguna
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
    }

    // Aktifkan audio ketika ada klik atau sentuhan pertama di layar
    document.body.addEventListener("click", initAudio, { once: true });
    document.body.addEventListener("touchstart", initAudio, { once: true });

    // Fungsi membunyikan bip
    function playBeepSound() {
        try {
            initAudio();

            if (audioCtx && audioCtx.state === "running") {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();

                oscillator.type = "sine";
                oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800 Hz

                gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

                oscillator.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                oscillator.start();
                oscillator.stop(audioCtx.currentTime + 0.15);
            } else {
                // Fallback jika AudioContext terblokir: gunakan HTML5 Audio sederhana
                const soundEffect = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUtvT18AAAAA");
                soundEffect.play().catch(() => {});
            }
        } catch (e) {
            console.error("Gagal memutar audio:", e);
        }
    }

    function isValidURL(string) {
        try {
            const url = new URL(string);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch (_) {
            return false;
        }
    }

    let lastScannedText = "";

    function onScanSuccess(decodedText, decodedResult) {
        if (decodedText === lastScannedText && !resultBox.classList.contains("hidden")) {
            return;
        }

        lastScannedText = decodedText;

        // Bunyikan bip saat berhasil scan
        playBeepSound();

        resultBox.classList.remove("hidden");
        resultText.innerText = decodedText;

        if (isValidURL(decodedText)) {
            openLinkBtn.href = decodedText;
            openLinkBtn.classList.remove("hidden");
        } else {
            openLinkBtn.classList.add("hidden");
        }
    }

    function onScanFailure(error) {
        // Abaikan pencarian frame
    }

    const html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { 
            fps: 10, 
            qrbox: { width: 250, height: 250 } 
        },
        false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    copyBtn.addEventListener("click", () => {
        const textToCopy = resultText.innerText;
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                alert("Teks berhasil disalin!");
            }).catch(err => {
                console.error("Gagal menyalin teks: ", err);
            });
        }
    });
});
