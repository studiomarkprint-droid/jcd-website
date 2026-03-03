import glob
import re

FILES = glob.glob('*.html')

# The replacement block we want to ensure exists
FORM_START_REPLACEMENT = """<form class="estimate" id="estimateForm" action="https://formsubmit.co/cristianemilmedranogarcia@gmail.com" method="POST">
            <input type="hidden" name="_subject" value="Nuevo Presupuesto Solicitado - JCD Tree Service">
            <input type="hidden" name="_captcha" value="false">"""

def fix_form(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    original = html

    # Look for the opening form tag, which might be:
    # <form class="estimate" id="estimateForm">
    # <form id="estimateForm">
    # <form action="https://formsubmit.co/cristianemilmedranogarcia@gmail.com" method="POST">
    
    # Let's standardize the estimate form tags.
    # We find where `<form ... id="estimateForm"` or similar is, and if it doesn't have action, we replace it.
    
    # First, let's remove any existing hidden inputs we're about to add so we don't multiply them
    # Because some files might already have them partially
    html = re.sub(r'<input type="hidden" name="_subject".*?>\s*', '', html)
    html = re.sub(r'<input type="hidden" name="_captcha".*?>\s*', '', html)
    html = re.sub(r'<input type="hidden" name="_next".*?>\s*', '', html)

    # Replace <form class="estimate" id="estimateForm">
    # Replace <form id="estimateForm">
    html = re.sub(
        r'<form[^>]*id="estimateForm"[^>]*>',
        FORM_START_REPLACEMENT,
        html,
        flags=re.IGNORECASE
    )

    # Some files might just have <form class="estimate" ...> without id or with different structure
    # like <form action="https://formsubmit...
    # But usually they have id="estimateForm". Let's check if the thank-you.html was matched.
    # thank-you.html has `<form action="https://formsubmit.co/cristianemilmedranogarcia@gmail.com" method="POST">`
    # without an ID usually, let's see:
    if 'id="estimateForm"' not in original and '<form action="https://formsubmit.co/' in html:
        # Just inject the hidden fields after the open <form ...>
        html = re.sub(
            r'(<form action="https://formsubmit\.co/[^"]+" method="POST">)',
            r'\1\n            <input type="hidden" name="_subject" value="Nuevo Presupuesto Solicitado - JCD Tree Service">\n            <input type="hidden" name="_captcha" value="false">',
            html,
            count=1
        )

    if html != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Fixed {filepath}")

for f in FILES:
    fix_form(f)
print("Done fixing forms.")
