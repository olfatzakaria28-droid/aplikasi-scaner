document.addEventListener("DOMContentLoaded", () => {
    const resultBox = document.getElementById("result-box");
    const resultText = document.getElementById("result-text");
    const copyBtn = document.getElementById("copy-btn");
    const openLinkBtn = document.getElementById("open-link-btn");

    // Fungsi untuk membuat suara beep menggunakan Web Audio API
    function playBeepSound() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // Frekuensi nada (Hz)
            
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // Volume
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.15); // Durasi beep (0.15 detik)
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
        // Mencegah beep berulang jika QR Code yang sama masih terdeteksi
        if (decodedText === lastScannedText && !resultBox.classList.contains("hidden")) {
            return;
        }

        lastScannedText = decodedText;

        // Memutar suara beep saat berhasil scan
        playBeepSound();

        // Tampilkan box hasil
        resultBox.classList.remove("hidden");
        resultText.innerText = decodedText;

        // Cek jika teks berupa URL / link
        if (isValidURL(decodedText)) {
            openLinkBtn.href = decodedText;
            openLinkBtn.classList.remove("hidden");
        } else {
            openLinkBtn.classList.add("hidden");
        }
    }

    function onScanFailure(error) {
        // Callback saat frame kamera belum menemukan QR Code
    }

    // Inisialisasi Scanner
    const html5QrcodeScanner = new Html5QrcodeScanner(
        "reader",
        { 
            fps: 10, 
            qrbox: { width: 250, height: 250 } 
        },
        /* verbose= */ false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    // Event listener button Salin Teks
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
