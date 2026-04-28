// Campo para subir comprobante de pago.

import { ImageUploadField } from '../forms/ImageUploadField';

export const PaymentReceiptUpload = ({ file, onChange }) => <ImageUploadField label="Subir comprobante" file={file} onChange={onChange} />;
