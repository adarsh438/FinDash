import React, { useState, useRef } from 'react';

interface ReceiptUploaderProps {
    file: File | null;
    onChange: (file: File | null) => void;
}

const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ file, onChange }) => {
    const [dragging, setDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (f: File) => {
        if (f.size > 5 * 1024 * 1024) {
            return; // silently reject > 5MB
        }
        if (!f.type.startsWith('image/')) {
            return;
        }
        onChange(f);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(f);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f);
    };

    const handleRemove = () => {
        onChange(null);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    if (file && preview) {
        return (
            <div>
                <p className="expense-section-label">🧾 Receipt</p>
                <div className="receipt-preview">
                    <img src={preview} alt="Receipt preview" />
                    <button className="receipt-remove-btn" onClick={handleRemove} type="button" aria-label="Remove receipt">
                        ×
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <p className="expense-section-label">🧾 Receipt (optional)</p>
            <div
                className={`receipt-dropzone ${dragging ? 'dragging' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <div className="receipt-dropzone-icon">📎</div>
                <p className="receipt-dropzone-text">Drop a receipt or click to browse</p>
                <p className="receipt-dropzone-hint">PNG, JPG up to 5MB</p>
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                    aria-label="Upload receipt"
                />
            </div>
        </div>
    );
};

export default ReceiptUploader;
