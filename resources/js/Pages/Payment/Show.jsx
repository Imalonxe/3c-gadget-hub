import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import promptpay from 'promptpay-qr';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import MainLayout from '@/Layouts/MainLayout';
import { BanknotesIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function Show({ order, paymentMethod, qrImageUrl, promptpayPayload, promptpayId, promptpayAmount }) {
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [localQrDataUrl, setLocalQrDataUrl] = useState(null);
    const [uploadVerified, setUploadVerified] = useState(false);
    const [verificationRedirect, setVerificationRedirect] = useState(null);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setUploadResult(null);
    };

    const handleUploadSlip = async () => {
        if (!selectedFile) return alert('กรุณาเลือกไฟล์สลิปก่อน');

        setUploading(true);

        try {
            const fd = new FormData();
            fd.append('slip', selectedFile);

            const res = await axios.post(route('payment.uploadSlip', order.order_id), fd, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Backend returns success boolean and may include 'redirect' when verified.
            setUploadResult({ success: true, message: res.data.message || 'สำเร็จ' });

            if (res.data && res.data.redirect) {
                // Mark verified and store redirect; do NOT auto-redirect — enable Complete button instead
                setUploadVerified(true);
                setVerificationRedirect(res.data.redirect);
            } else {
                // If SlipOK responded but did not verify, keep verified false
                setUploadVerified(false);
                setVerificationRedirect(null);
            }

        } catch (err) {
            const message = err?.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพโหลดสลิป กรุณาลองใหม่อีกครั้ง';
            setUploadResult({ success: false, message });
            setUploadVerified(false);
            setVerificationRedirect(null);
        } finally {
            setUploading(false);
        }
    };
    const handlePaymentComplete = () => {
        // If upload verification returned a redirect, go there (server may have finalized payment)
        if (verificationRedirect) {
            window.location.href = verificationRedirect;
            return;
        }

        // Otherwise, POST to the payment.success endpoint as before
        router.post(route('payment.success', order.order_id));
    };

    const handlePaymentFailed = () => {
        // Use POST so the route that expects POST is invoked (avoid MethodNotAllowed)
        router.post(route('payment.failed', order.order_id));
    };

    // Generate local QR data URL from the payload. Prefer library-generated payload using promptpay ID & amount.
    useEffect(() => {
        let mounted = true;

        async function genFromPayload(payload) {
            try {
                const dataUrl = await QRCode.toDataURL(payload, { errorCorrectionLevel: 'H' });
                if (mounted) setLocalQrDataUrl(dataUrl);
            } catch (e) {
                console.error('Failed to generate QR data URL', e);
            }
        }

        // If we have a promptpay ID (clean numeric) and an amount, prefer generating payload with the library
        try {
            if (promptpay && typeof promptpay === 'function' && typeof promptpayId !== 'undefined' && promptpayId) {
                const amount = (typeof promptpayAmount !== 'undefined' && promptpayAmount) ? Number(promptpayAmount) : undefined;
                const payload = promptpay(promptpayId, amount ? { amount } : {});
                if (payload) {
                    genFromPayload(payload);
                    return () => { mounted = false; };
                }
            }
        } catch (e) {
            console.warn('promptpay-qr failed to generate payload:', e);
        }

        // Fall back to server-provided payload if present
        if (promptpayPayload) {
            genFromPayload(promptpayPayload);
        }

        return () => { mounted = false; };
    }, [promptpayPayload, order, promptpayId, promptpayAmount]);

    return (
        <MainLayout>
            <Head title="Payment - Complete Your Order" />
            
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <BanknotesIcon className="mx-auto h-16 w-16 text-blue-600 mb-4" />
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Complete Your Payment
                                </h1>
                                <p className="text-gray-600">
                                    Order #{order.order_number}
                                </p>
                                <p className="text-2xl font-semibold text-gray-900 mt-4">
                                    Total: ฿{order.total_amount ? Number(order.total_amount).toFixed(2) : '0.00'}
                                </p>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                                
                                {order.items && order.items.map((item) => (
                                    <div key={item.order_item_id} className="flex items-center space-x-4 py-3 border-b last:border-b-0">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.product_name || item.product?.product_name || 'Product'}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-sm font-medium">
                                            ฿{(((item.price || item.unit_price) || 0) * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="mt-4 space-y-2 pt-4 border-t">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">฿{order.subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">฿{order.shipping_fee}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax</span>
                                        <span className="font-medium">฿{order.tax}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                                        <span>Total</span>
                                        <span className="text-blue-600">฿{order.total_amount ? Number(order.total_amount).toFixed(2) : '0.00'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Instructions - contextual by payment method */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-blue-900 mb-3">Payment Instructions</h3>
                                <div className="space-y-2 text-sm text-blue-800">
                                    {order.payment_method === 'promptpay' ? (
                                        <>
                                            <p>� Scan the PromptPay QR code shown below using your banking app and complete the transfer for the exact order amount.</p>
                                            <p>📸 After you complete the transfer, upload the transfer slip or screenshot using the upload control on this page so we can verify it automatically.</p>
                                        </>
                                    ) : (
                                        <>
                                            <p>📌 Follow the instructions provided by the chosen payment method to complete your payment.</p>
                                            <p>✅ You will receive a confirmation after we verify your payment.</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* PromptPay QR + Upload Slip UI */}
                            {order.payment_method === 'promptpay' && (
                                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 mb-6 border-2 border-gray-200 shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">PromptPay - Scan QR and Upload Slip</h3>

                                    {/* QR Code Section */}
                                    <div className="flex justify-center mb-8">
                                        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200">
                                            {localQrDataUrl ? (
                                                <img src={localQrDataUrl} alt="PromptPay QR" className="w-72 h-72 object-contain" />
                                            ) : (typeof qrImageUrl !== 'undefined' && qrImageUrl ? (
                                                <img src={qrImageUrl} alt="PromptPay QR" className="w-72 h-72 object-contain" />
                                            ) : (
                                                <div className="w-72 h-72 bg-gray-100 border rounded flex items-center justify-center">
                                                    <span className="text-sm text-gray-500">QR Placeholder</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Upload Section */}
                                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                                        <p className="text-sm text-gray-700 mb-6 text-center">
                                            After scanning the QR to pay, please upload the slip from the transfer.
                                        </p>

                                        {/* Custom File Input */}
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="slip-upload"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                <label
                                                    htmlFor="slip-upload"
                                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-indigo-400 transition-colors duration-200"
                                                >
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                        <p className="mb-2 text-sm text-gray-500">
                                                            <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                                        {selectedFile && (
                                                            <p className="mt-2 text-sm font-medium text-gray-700">
                                                                Selected: {selectedFile.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </label>
                                            </div>

                                            <button
                                                onClick={handleUploadSlip}
                                                disabled={uploading || !selectedFile}
                                                className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ${
                                                    uploading || !selectedFile
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md'
                                                }`}
                                            >
                                                {uploading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                        </svg>
                                                        Upload Slip
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {uploadResult && (
                                            <div className={`mt-4 p-4 rounded-lg ${uploadResult.success ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                                                <div className="flex items-start">
                                                    {uploadResult.success ? (
                                                        <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                                                    ) : (
                                                        <XCircleIcon className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    <div className="flex-1">
                                                        <strong className="block mb-1">{uploadResult.success ? 'Success' : 'Error'}</strong>
                                                        <div className="text-sm">{uploadResult.message}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handlePaymentComplete}
                                    disabled={!uploadVerified}
                                    className={`${!uploadVerified ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'} flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${uploadVerified ? 'focus:ring-green-500' : ''}`}
                                >
                                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                                    Complete Payment
                                </button>
                                
                                <button
                                    onClick={handlePaymentFailed}
                                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <XCircleIcon className="h-5 w-5 mr-2" />
                                    Cancel
                                </button>
                            </div>

                            {/* Shipping Address */}
                            {order.shipping_address && (
                                <div className="mt-8 pt-6 border-t">
                                    <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><strong>Name:</strong> {order.shipping_address.full_name}</p>
                                        <p><strong>Phone:</strong> {order.shipping_address.phone}</p>
                                        <p><strong>Address:</strong> {order.shipping_address.address}</p>
                                        <p><strong>City:</strong> {order.shipping_address.city}</p>
                                        <p><strong>Postal Code:</strong> {order.shipping_address.postal_code}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
