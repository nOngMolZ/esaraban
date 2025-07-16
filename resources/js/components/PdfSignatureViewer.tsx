import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Document, Page } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { 
    ZoomIn, 
    ZoomOut, 
    Edit3, 
    Trash2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

interface Signature {
    id: string;
    strokes: Array<{ x: number; y: number; color?: string; lineWidth?: number }[]>;
    pageIndex: number;
    pdfWidth: number;
    pdfHeight: number;
}

interface PreviousSignature {
    id: number;
    user: {
        fname: string;
        lname: string;
    };
    step: number;
    signed_at: string;
    signature_data: string;
}

interface Props {
    fileUrl: string;
    signatures: Signature[];
    onSignaturesChange: (signatures: Signature[]) => void;
    previousSignatures?: PreviousSignature[];
    readOnly?: boolean;
    className?: string;
}

interface SignatureDrawingData {
    isDrawing: boolean;
    currentStroke: Array<{ x: number; y: number; color?: string; lineWidth?: number }>;
}

export default function PdfSignatureViewer({
    fileUrl,
    signatures,
    onSignaturesChange,
    previousSignatures = [],
    readOnly = false,
    className = ''
}: Props) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
    const [drawingData, setDrawingData] = useState<SignatureDrawingData>({
        isDrawing: false,
        currentStroke: []
    });
    const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [penSize, setPenSize] = useState<number>(2);
    const [penColor, setPenColor] = useState<string>('#000');

    const pdfContainerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pageRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    // Document options เพื่อป้องกัน unnecessary rerenders
    const documentOptions = React.useMemo(
        () => ({
            httpHeaders: {},
            withCredentials: false,
        }),
        [],
    );

    // ฟังก์ชันสำหรับโหลด PDF
    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    // ฟังก์ชันสำหรับจับการโหลด PDF page เสร็จเพื่อรับขนาดจริง
    const onPageLoadSuccess = (page: { getViewport: (options: { scale: number }) => { width: number; height: number } }) => {
        const viewport = page.getViewport({ scale: 1 });
        setPdfDimensions({
            width: viewport.width,
            height: viewport.height
        });
        console.log('PDF dimensions set:', { width: viewport.width, height: viewport.height });
    };

    // ฟังก์ชันสำหรับวาดลายเซ็นบน canvas
    const drawSignatureOnCanvas = useCallback((ctx: CanvasRenderingContext2D, strokes: Array<{ x: number; y: number; color?: string; lineWidth?: number }[]>, pdfWidth: number, pdfHeight: number) => {
        const canvas = ctx.canvas;
        const scaleX = canvas.width / pdfWidth;
        const scaleY = canvas.height / pdfHeight;

        strokes.forEach(stroke => {
            if (stroke.length < 2) return;
            
            // ใช้สีและขนาดเส้นจาก stroke หรือค่าเริ่มต้น
            const strokeColor = stroke[0]?.color || '#000';
            const strokeWidth = stroke[0]?.lineWidth || 2;
            
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(stroke[0].x * scaleX, stroke[0].y * scaleY);
            
            for (let i = 1; i < stroke.length; i++) {
                ctx.lineTo(stroke[i].x * scaleX, stroke[i].y * scaleY);
            }
            ctx.stroke();
        });
    }, []);

    // ฟังก์ชันสำหรับ redraw canvas ทั้งหมด
    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // ล้าง canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // วาดลายเซ็นของหน้าปัจจุบัน
        const currentPageSignatures = signatures.filter(sig => sig.pageIndex === currentPage - 1);
        currentPageSignatures.forEach(signature => {
            drawSignatureOnCanvas(ctx, signature.strokes, signature.pdfWidth, signature.pdfHeight);
        });

        // วาดลายเซ็นเก่า
        previousSignatures.forEach(prevSig => {
            try {
                const sigData = JSON.parse(prevSig.signature_data);
                if (sigData.signatures) {
                    sigData.signatures
                        .filter((sig: Signature) => sig.pageIndex === currentPage - 1)
                        .forEach((sig: Signature) => {
                            if (sig.strokes) {
                                ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)'; // สีเขียวสำหรับลายเซ็นเก่า
                                drawSignatureOnCanvas(ctx, sig.strokes, sig.pdfWidth, sig.pdfHeight);
                                ctx.strokeStyle = '#000'; // กลับเป็นสีดำ
                            }
                        });
                }
            } catch (error) {
                console.warn('Error parsing previous signature data:', error);
            }
        });
    }, [signatures, currentPage, previousSignatures, drawSignatureOnCanvas]);

    // Helper function to convert touch event to mouse event
    const convertTouchToMouseEvent = (touch: React.Touch): React.MouseEvent<HTMLCanvasElement> => {
        return {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => {},
            currentTarget: canvasRef.current,
        } as React.MouseEvent<HTMLCanvasElement>;
    };

    // ฟังก์ชันสำหรับเริ่มวาดลายเซ็น
    const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawingMode || readOnly) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (pdfDimensions.width / rect.width);
        const y = (e.clientY - rect.top) * (pdfDimensions.height / rect.height);

        setDrawingData({
            isDrawing: true,
            currentStroke: [{ x, y, color: penColor, lineWidth: penSize }]
        });
    }, [isDrawingMode, readOnly, pdfDimensions, penColor, penSize]);

    // ฟังก์ชันสำหรับวาดลายเซ็น
    const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!drawingData.isDrawing || !isDrawingMode || readOnly) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (pdfDimensions.width / rect.width);
        const y = (e.clientY - rect.top) * (pdfDimensions.height / rect.height);

        const newStroke = [...drawingData.currentStroke, { x, y, color: penColor, lineWidth: penSize }];
        setDrawingData(prev => ({
            ...prev,
            currentStroke: newStroke
        }));

        // วาดบน canvas
        const ctx = canvas.getContext('2d');
        if (ctx && drawingData.currentStroke.length > 0) {
            const lastPoint = drawingData.currentStroke[drawingData.currentStroke.length - 1];
            const scaleX = canvas.width / pdfDimensions.width;
            const scaleY = canvas.height / pdfDimensions.height;
            
            ctx.strokeStyle = penColor;
            ctx.lineWidth = penSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(lastPoint.x * scaleX, lastPoint.y * scaleY);
            ctx.lineTo(x * scaleX, y * scaleY);
            ctx.stroke();
        }
    }, [drawingData.isDrawing, drawingData.currentStroke, isDrawingMode, readOnly, pdfDimensions, penColor, penSize]);

    // ฟังก์ชันสำหรับจบการวาด
    const stopDrawing = useCallback(() => {
        if (!drawingData.isDrawing) return;

        if (drawingData.currentStroke.length > 1) {
            // สร้างลายเซ็นใหม่
            const newSignature: Signature = {
                id: `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                strokes: [drawingData.currentStroke],
                pageIndex: currentPage - 1,
                pdfWidth: pdfDimensions.width,
                pdfHeight: pdfDimensions.height
            };

            // รวมกับลายเซ็นเก่าหรือเพิ่มใหม่
            const existingSignature = signatures.find(sig => sig.pageIndex === currentPage - 1);
            if (existingSignature) {
                const updatedSignatures = signatures.map(sig => 
                    sig.pageIndex === currentPage - 1
                        ? { ...sig, strokes: [...sig.strokes, drawingData.currentStroke] }
                        : sig
                );
                onSignaturesChange(updatedSignatures);
            } else {
                onSignaturesChange([...signatures, newSignature]);
            }
        }

        setDrawingData({
            isDrawing: false,
            currentStroke: []
        });
    }, [drawingData.isDrawing, drawingData.currentStroke, currentPage, pdfDimensions, signatures, onSignaturesChange]);

    // ฟังก์ชันสำหรับลบลายเซ็นของหน้าปัจจุบัน
    const clearCurrentPageSignatures = () => {
        onSignaturesChange(signatures.filter(sig => sig.pageIndex !== currentPage - 1));
    };

    // อัพเดต canvas size และ redraw เมื่อมีการเปลี่ยนแปลง
    useEffect(() => {
        const updateCanvasSize = () => {
            const pageContainer = pageRefs.current[currentPage];
            const canvas = canvasRef.current;
            
            if (pageContainer && canvas) {
                const rect = pageContainer.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
                
                console.log('Canvas size updated:', { 
                    canvasWidth: rect.width, 
                    canvasHeight: rect.height,
                    pdfWidth: pdfDimensions.width,
                    pdfHeight: pdfDimensions.height,
                    scale: scale
                });
                
                // redraw ลายเซ็นทั้งหมด
                setTimeout(() => redrawCanvas(), 50);
            }
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        return () => window.removeEventListener('resize', updateCanvasSize);
    }, [currentPage, scale, redrawCanvas, pdfDimensions]);

    // Redraw เมื่อมีการเปลี่ยนแปลงลายเซ็น
    useEffect(() => {
        redrawCanvas();
    }, [signatures, currentPage, previousSignatures, redrawCanvas]);

    return (
        <div className={`pdf-signature-viewer ${className} relative`}>
            {/* PDF Viewer - iPad optimized */}
            <div 
                className="relative w-full bg-zinc-300 border shadow-sm overflow-hidden"
                style={{
                    aspectRatio: "1 / 1.414", // A4 ratio
                    minHeight: '70vh', // Increased for iPad
                    maxHeight: '75vh' // Reduced to make room for bottom toolbar
                }}
            >
                <div
                    ref={pdfContainerRef}
                    className="absolute inset-0 flex items-center justify-center overflow-auto bg-gray-100"
                >
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        options={documentOptions}
                        loading={null}
                        className="flex items-center justify-center h-full"
                    >
                        <div className="relative">
                            <div 
                                ref={(el) => { pageRefs.current[currentPage] = el; }}
                                className="relative inline-block"
                            >
                                <Page
                                    pageNumber={currentPage}
                                    scale={scale}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    loading={null}
                                    className="mx-auto shadow-lg"
                                    onLoadSuccess={onPageLoadSuccess}
                                />

                                {/* Drawing Canvas - Enhanced for touch */}
                                <canvas
                                    ref={canvasRef}
                                    className={`absolute top-0 left-0 ${isDrawingMode && !readOnly ? 'cursor-crosshair touch-none' : 'pointer-events-none'}`}
                                    style={{ 
                                        pointerEvents: isDrawingMode && !readOnly ? 'auto' : 'none',
                                        zIndex: 10,
                                        touchAction: isDrawingMode && !readOnly ? 'none' : 'auto'
                                    }}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    // Touch events for iPad
                                    onTouchStart={(e) => {
                                        e.preventDefault();
                                        const touch = e.touches[0];
                                        const mouseEvent = convertTouchToMouseEvent(touch);
                                        startDrawing(mouseEvent);
                                    }}
                                    onTouchMove={(e) => {
                                        e.preventDefault();
                                        const touch = e.touches[0];
                                        const mouseEvent = convertTouchToMouseEvent(touch);
                                        draw(mouseEvent);
                                    }}
                                    onTouchEnd={(e) => {
                                        e.preventDefault();
                                        stopDrawing();
                                    }}
                                />
                            </div>
                        </div>
                    </Document>
                </div>
            </div>

            {/* Bottom Toolbar - Two Rows */}
            <div className="bg-white border-t shadow-lg">
                {/* First Row - Navigation and Zoom */}
                <div className="flex items-center justify-between gap-3 p-3 border-b border-gray-100">
                    {/* Navigation Controls */}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage <= 1}
                            className="h-10 px-4 touch-manipulation"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="px-4 py-2 bg-white rounded text-sm font-medium min-w-[80px] text-center border">
                            หน้า {currentPage} จาก {numPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                            disabled={currentPage >= numPages}
                            className="h-10 px-4 touch-manipulation"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                            className="h-10 px-4 touch-manipulation"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <div className="px-4 py-2 bg-white rounded text-sm font-medium min-w-[70px] text-center border">
                            {Math.round(scale * 100)}%
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setScale(Math.min(3, scale + 0.1))}
                            className="h-10 px-4 touch-manipulation"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Signature Count */}
                    <div>
                        <Badge variant="outline" className="text-sm py-2 px-4">
                            ลายเซ็น: {signatures.filter(sig => sig.pageIndex === currentPage - 1).length}
                        </Badge>
                    </div>
                </div>

                {/* Second Row - Drawing Tools */}
                {!readOnly && (
                    <div className="flex items-center justify-center gap-3 p-3">
                        <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3 w-full max-w-2xl">
                            {/* Drawing Toggle */}
                            <Button
                                variant={isDrawingMode ? "default" : "outline"}
                                size="sm"
                                onClick={() => setIsDrawingMode(!isDrawingMode)}
                                className="h-12 px-6 touch-manipulation text-base"
                            >
                                <Edit3 className="w-5 h-5 mr-2" />
                                วาดลายเซ็น
                            </Button>
                            
                            {/* Pen Controls - Show when drawing mode is active */}
                            {isDrawingMode && (
                                <>
                                    <div className="w-px h-8 bg-blue-300"></div>
                                    
                                    {/* Pen Size */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-blue-700">ขนาดปากกา:</span>
                                        <Select value={penSize.toString()} onValueChange={(value) => setPenSize(Number(value))}>
                                            <SelectTrigger className="w-20 h-10 bg-white text-black touch-manipulation">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1px</SelectItem>
                                                <SelectItem value="2">2px</SelectItem>
                                                <SelectItem value="3">3px</SelectItem>
                                                <SelectItem value="4">4px</SelectItem>
                                                <SelectItem value="5">5px</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Color Picker */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-blue-700">สีปากกา:</span>
                                        <input
                                            type="color"
                                            value={penColor}
                                            onChange={(e) => setPenColor(e.target.value)}
                                            className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer touch-manipulation"
                                            title="เลือกสีปากกา"
                                        />
                                    </div>

                                    {/* Preview */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-blue-700">ตัวอย่าง:</span>
                                        <div className="flex items-center justify-center w-12 h-10 bg-white rounded border-2 border-gray-300">
                                            <div 
                                                className="rounded-full"
                                                style={{ 
                                                    backgroundColor: penColor,
                                                    width: `${Math.max(3, penSize * 1.5)}px`, 
                                                    height: `${Math.max(3, penSize * 1.5)}px` 
                                                }}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                            
                            {/* Clear Button */}
                            {signatures.filter(sig => sig.pageIndex === currentPage - 1).length > 0 && (
                                <>
                                    <div className="w-px h-8 bg-blue-300"></div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearCurrentPageSignatures}
                                        className="h-12 px-4 text-red-600 border-red-600 hover:bg-red-50 touch-manipulation"
                                    >
                                        <Trash2 className="w-5 h-5 mr-2" />
                                        ลบลายเซ็น
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Status Bar - Simplified */}
            {isDrawingMode && !readOnly && (
                <div className="p-3 border-t bg-blue-50 text-sm text-blue-700">
                    <div className="flex items-center justify-center gap-2">
                        <span>💡 แตะและลากเพื่อวาดลายเซ็นบน PDF</span>
                        <span className="hidden sm:inline">
                            | ขนาด: <strong>{penSize}px</strong> | สี: 
                            <span 
                                className="inline-block w-3 h-3 rounded-full ml-1 border"
                                style={{ backgroundColor: penColor }}
                            ></span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
} 