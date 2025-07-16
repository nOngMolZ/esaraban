import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { 
    ZoomIn, 
    ZoomOut, 
    RotateCw, 
    Trash2,
    ChevronLeft,
    ChevronRight,
    Stamp,
    Image as ImageIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

interface StampItem {
    id: string;
    stampId: number;
    imageUrl: string;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
        pageIndex: number;
        rotation: number;
        pdfWidth: number;
        pdfHeight: number;
    };
}

interface AvailableStamp {
    id: number;
    name: string;
    file_path: string;
    category: string;
    preview_url: string;
}

interface Props {
    fileUrl: string;
    stamps: StampItem[];
    onStampsChange: (stamps: StampItem[]) => void;
    availableStamps: AvailableStamp[];
    readOnly?: boolean;
    className?: string;
}

export default function StampViewer({
    fileUrl,
    stamps,
    onStampsChange,
    availableStamps,
    readOnly = false,
    className = ''
}: Props) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
    const [selectedStampType, setSelectedStampType] = useState<AvailableStamp | null>(null);
    const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isResizing, setIsResizing] = useState<boolean>(false);
    const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [resizeStartData, setResizeStartData] = useState<{ width: number; height: number; x: number; y: number }>({ width: 0, height: 0, x: 0, y: 0 });

    const pdfContainerRef = useRef<HTMLDivElement>(null);
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

    // ฟังก์ชันสำหรับเพิ่มตราประทับ
    const addStamp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!selectedStampType || readOnly || pdfDimensions.width === 0) return;

        const pageContainer = pageRefs.current[currentPage];
        if (!pageContainer) return;

        const rect = pageContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // แปลงตำแหน่งจากหน้าจอเป็น PDF coordinates
        const pdfX = (clickX / rect.width) * pdfDimensions.width;
        const pdfY = (clickY / rect.height) * pdfDimensions.height;

        // ขนาดเริ่มต้นของตรา (ในหน่วย PDF points)
        const defaultWidth = 80;
        const defaultHeight = 80;

        const newStamp: StampItem = {
            id: `stamp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            stampId: selectedStampType.id,
            imageUrl: selectedStampType.preview_url,
            position: {
                x: Math.max(0, pdfX - defaultWidth / 2),
                y: Math.max(0, pdfY - defaultHeight / 2),
                width: defaultWidth,
                height: defaultHeight,
                pageIndex: currentPage - 1,
                rotation: 0,
                pdfWidth: pdfDimensions.width,
                pdfHeight: pdfDimensions.height
            }
        };

        console.log('Adding new stamp:', newStamp);
        const updatedStamps = [...stamps, newStamp];
        console.log('Updated stamps array:', updatedStamps);
        onStampsChange(updatedStamps);
        setSelectedStampType(null); // ล้างการเลือกหลังจากวาง
    }, [selectedStampType, stamps, onStampsChange, currentPage, readOnly, pdfDimensions]);

    // ฟังก์ชันสำหรับลบตรา
    const deleteStamp = useCallback((stampId: string) => {
        onStampsChange(stamps.filter(stamp => stamp.id !== stampId));
        setSelectedStamp(null);
    }, [stamps, onStampsChange]);

    // ฟังก์ชันสำหรับหมุนตรา
    const rotateStamp = useCallback((stampId: string) => {
        onStampsChange(stamps.map(stamp => 
            stamp.id === stampId
                ? {
                    ...stamp,
                    position: {
                        ...stamp.position,
                        rotation: (stamp.position.rotation + 90) % 360
                    }
                }
                : stamp
        ));
    }, [stamps, onStampsChange]);

    // ฟังก์ชันสำหรับย้ายตรา
    const moveStamp = useCallback((stampId: string, deltaX: number, deltaY: number) => {
        onStampsChange(stamps.map(stamp => {
            if (stamp.id !== stampId) return stamp;
            
            const pageContainer = pageRefs.current[currentPage];
            if (!pageContainer) return stamp;
            
            const rect = pageContainer.getBoundingClientRect();
            const pdfDeltaX = (deltaX / rect.width) * pdfDimensions.width;
            const pdfDeltaY = (deltaY / rect.height) * pdfDimensions.height;
            
            return {
                ...stamp,
                position: {
                    ...stamp.position,
                    x: Math.max(0, Math.min(pdfDimensions.width - stamp.position.width, stamp.position.x + pdfDeltaX)),
                    y: Math.max(0, Math.min(pdfDimensions.height - stamp.position.height, stamp.position.y + pdfDeltaY))
                }
            };
        }));
    }, [stamps, onStampsChange, currentPage, pdfDimensions]);

    // ฟังก์ชันสำหรับปรับขนาดตรา
    const resizeStamp = useCallback((stampId: string, width: number, height: number) => {
        onStampsChange(stamps.map(stamp => 
            stamp.id === stampId
                ? {
                    ...stamp,
                    position: {
                        ...stamp.position,
                        width: Math.max(30, width),
                        height: Math.max(30, height)
                    }
                }
                : stamp
        ));
    }, [stamps, onStampsChange]);

    // จัดหมวดหมู่ตรา
    const groupedStamps = availableStamps.reduce((groups, stamp) => {
        const category = stamp.category || 'อื่นๆ';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(stamp);
        return groups;
    }, {} as Record<string, AvailableStamp[]>);

    // คำนวณตำแหน่งตราในหน้าจอ
    const getStampDisplayPosition = useCallback((stamp: StampItem) => {
        if (pdfDimensions.width === 0 || pdfDimensions.height === 0) return { x: 0, y: 0, width: 0, height: 0 };
        
        const pageContainer = pageRefs.current[currentPage];
        if (!pageContainer) return { x: 0, y: 0, width: 0, height: 0 };
        
        const rect = pageContainer.getBoundingClientRect();
        const scaleX = rect.width / stamp.position.pdfWidth;
        const scaleY = rect.height / stamp.position.pdfHeight;
        
        return {
            x: stamp.position.x * scaleX,
            y: stamp.position.y * scaleY,
            width: stamp.position.width * scaleX,
            height: stamp.position.height * scaleY
        };
    }, [currentPage, pdfDimensions]);

    // ฟังก์ชัน drag handlers
    const handleStampMouseDown = useCallback((e: React.MouseEvent, stampId: string) => {
        e.stopPropagation();
        setSelectedStamp(stampId);
        setIsDragging(true);
        setDragStartPos({ x: e.clientX, y: e.clientY });
    }, []);

    const handleResizeMouseDown = useCallback((e: React.MouseEvent, stamp: StampItem) => {
        e.stopPropagation();
        setIsResizing(true);
        setSelectedStamp(stamp.id);
        setDragStartPos({ x: e.clientX, y: e.clientY });
        setResizeStartData({
            width: stamp.position.width,
            height: stamp.position.height,
            x: stamp.position.x,
            y: stamp.position.y
        });
    }, []);

    // Global mouse handlers
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && selectedStamp) {
                const deltaX = e.clientX - dragStartPos.x;
                const deltaY = e.clientY - dragStartPos.y;
                moveStamp(selectedStamp, deltaX, deltaY);
                setDragStartPos({ x: e.clientX, y: e.clientY });
            } else if (isResizing && selectedStamp) {
                const deltaX = e.clientX - dragStartPos.x;
                const deltaY = e.clientY - dragStartPos.y;
                
                // คำนวณขนาดใหม่ (รักษาอัตราส่วน)
                const pageContainer = pageRefs.current[currentPage];
                if (!pageContainer) return;
                
                const rect = pageContainer.getBoundingClientRect();
                const pdfDeltaX = (deltaX / rect.width) * pdfDimensions.width;
                const pdfDeltaY = (deltaY / rect.height) * pdfDimensions.height;
                
                const newWidth = Math.max(30, resizeStartData.width + pdfDeltaX);
                const newHeight = Math.max(30, resizeStartData.height + pdfDeltaY);
                
                resizeStamp(selectedStamp, newWidth, newHeight);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, selectedStamp, dragStartPos, moveStamp, resizeStamp, currentPage, pdfDimensions, resizeStartData]);

    return (
        <div className={`stamp-viewer ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                    {/* Navigation */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm px-3">
                        หน้า {currentPage} จาก {numPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                        disabled={currentPage >= numPages}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Zoom Controls */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                    >
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm px-3">{Math.round(scale * 100)}%</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setScale(Math.min(3, scale + 0.1))}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline">
                        ตราประทับ: {stamps.filter(stamp => stamp.position.pageIndex === currentPage - 1).length}
                    </Badge>
                </div>
            </div>

            <div className="flex flex-col">
                {/* Stamp Library Top Panel */}
                {!readOnly && (
                    <div className="border-b bg-gray-50 max-h-48 overflow-y-auto">
                        <div className="p-4">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <Stamp className="w-4 h-4" />
                                คลังตราประทับ
                            </h3>
                            
                            {Object.keys(groupedStamps).length === 0 ? (
                                <div className="text-center py-4 text-gray-500">
                                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">ไม่มีตราประทับ</p>
                                </div>
                            ) : (
                                <div className="flex gap-6">
                                    {Object.entries(groupedStamps).map(([category, categoryStamps]) => (
                                        <div key={category} className="flex-shrink-0">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                                            <div className="flex gap-2">
                                                {categoryStamps.map((availableStamp) => (
                                                    <button
                                                        key={availableStamp.id}
                                                        onClick={() => setSelectedStampType(availableStamp)}
                                                        className={`p-2 border rounded-lg hover:bg-white hover:shadow-sm transition-all w-20 h-20 ${
                                                            selectedStampType?.id === availableStamp.id
                                                                ? 'border-blue-500 bg-blue-50'
                                                                : 'border-gray-200 bg-white'
                                                        }`}
                                                        title={availableStamp.name}
                                                    >
                                                        <img
                                                            src={availableStamp.preview_url}
                                                            alt={availableStamp.name}
                                                            className="w-full h-12 object-contain"
                                                        />
                                                        <p className="text-xs text-gray-600 mt-1 truncate">
                                                            {availableStamp.name}
                                                        </p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* PDF Viewer */}
                <div className="flex-1">
                    <div 
                        className="relative w-full bg-zinc-300 border shadow-sm overflow-hidden"
                        style={{
                            aspectRatio: "1 / 1.414", // A4 ratio
                            minHeight: '600px'
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
                                        className={`relative inline-block ${selectedStampType ? 'cursor-crosshair' : ''}`}
                                        onClick={selectedStampType ? addStamp : undefined}
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

                                        {/* Current Page Stamps */}
                                        {stamps
                                            .filter(stamp => stamp.position.pageIndex === currentPage - 1)
                                            .map((stamp) => {
                                                const displayPos = getStampDisplayPosition(stamp);
                                                return (
                                                    <div
                                                        key={stamp.id}
                                                        className={`absolute cursor-move border-2 ${
                                                            selectedStamp === stamp.id
                                                                ? 'border-blue-500'
                                                                : 'border-transparent hover:border-gray-400'
                                                        }`}
                                                        style={{
                                                            left: displayPos.x,
                                                            top: displayPos.y,
                                                            width: displayPos.width,
                                                            height: displayPos.height,
                                                            transform: `rotate(${stamp.position.rotation}deg)`,
                                                            zIndex: 5
                                                        }}
                                                        onMouseDown={(e) => handleStampMouseDown(e, stamp.id)}
                                                    >
                                                        <img
                                                            src={stamp.imageUrl}
                                                            alt="Stamp"
                                                            className="w-full h-full object-contain"
                                                            draggable={false}
                                                        />
                                                        
                                                        {/* Stamp Controls */}
                                                        {selectedStamp === stamp.id && !readOnly && (
                                                            <div className="absolute -top-10 left-0 flex gap-1 bg-white border rounded shadow-lg p-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        rotateStamp(stamp.id);
                                                                    }}
                                                                    className="h-6 w-6 p-0"
                                                                >
                                                                    <RotateCw className="w-3 h-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteStamp(stamp.id);
                                                                    }}
                                                                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {/* Resize Handles */}
                                                        {selectedStamp === stamp.id && !readOnly && (
                                                            <>
                                                                {/* Corner resize handle */}
                                                                <div
                                                                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize"
                                                                    onMouseDown={(e) => handleResizeMouseDown(e, stamp)}
                                                                />
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            </Document>
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="p-3 border-t bg-gray-50 text-sm text-gray-600">
                        {selectedStampType && !readOnly && (
                            <div className="text-blue-600 font-medium">
                                💡 คลิกบนเอกสารเพื่อวางตรา "{selectedStampType.name}"
                            </div>
                        )}
                        {stamps.length > 0 && (
                            <div>
                                ตราประทับทั้งหมด: {stamps.length} รายการ
                            </div>
                        )}
                        {!readOnly && availableStamps.length === 0 && (
                            <div className="text-amber-600">
                                ⚠️ ไม่มีตราประทับในระบบ กรุณาติดต่อผู้ดูแลระบบเพื่อเพิ่มตราประทับ
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 