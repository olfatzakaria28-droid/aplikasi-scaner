document.addEventListener("DOMContentLoaded", () => {
    const resultBox = document.getElementById("result-box");
    const resultText = document.getElementById("result-text");
    const copyBtn = document.getElementById("copy-btn");
    const openLinkBtn = document.getElementById("open-link-btn");

    function isValidURL(string) {
        try {
            const url = new URL(string);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch (_) {
            return false;
        }
    }

    function onScanSuccess(decodedText, decodedResult) {
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
        // Callback saat frame kamera belum menemukan QR Code (bisa diabaikan agar log tidak penuh)
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
