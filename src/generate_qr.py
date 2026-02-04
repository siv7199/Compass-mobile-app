import qrcode
import sys

# The URL to encode
url = "exp://kwdtzyq-svangara-8081.exp.direct"

# Create QR code instance
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=10,
    border=4,
)

qr.add_data(url)
qr.make(fit=True)

# Create an image from the QR Code instance
img = qr.make_image(fill_color="black", back_color="white")

# Save it to the artifacts directory (accessed via relative path or known path)
# We will save it in the current directory and I will move it or reference it.
output_path = "expo_qr_code.png"
img.save(output_path)
print(f"QR code generated at {output_path}")
