'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Text, Image as KonvaImage, Transformer, Rect } from 'react-konva';
import useImage from 'use-image';

interface ElementProps {
  id: string;
  type: 'image' | 'text' | 'shape';
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  src?: string;
  opacity?: number;
  rotation?: number;
  draggable?: boolean;
}

interface KonvaEditorProps {
  elements: ElementProps[];
  setElements: React.Dispatch<React.SetStateAction<ElementProps[]>>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  backgroundUrl: string | null;
}

// Componente para imágenes que maneja react-konva / use-image
const CanvasImage = ({ shapeProps, isSelected, onSelect, onChange }: any) => {
  const shapeRef = useRef<any>();
  const trRef = useRef<any>();
  const [img] = useImage(shapeProps.src, 'anonymous');

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        image={img}
        draggable={shapeProps.draggable !== false}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation()
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

// Componente de texto interactivo
const CanvasText = ({ shapeProps, isSelected, onSelect, onChange }: any) => {
  const shapeRef = useRef<any>();
  const trRef = useRef<any>();

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Text
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={(e) => {
          e.cancelBubble = true;
          const newText = window.prompt("Editar texto:", shapeProps.text);
          if (newText !== null && newText.trim() !== '') {
            onChange({ ...shapeProps, text: newText });
          }
        }}
        onDblTap={(e) => {
          e.cancelBubble = true;
          const newText = window.prompt("Editar texto:", shapeProps.text);
          if (newText !== null && newText.trim() !== '') {
            onChange({ ...shapeProps, text: newText });
          }
        }}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            fontSize: (shapeProps.fontSize || 20) * scaleX,
            rotation: node.rotation()
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export default function KonvaEditor({ elements, setElements, selectedId, setSelectedId, backgroundUrl }: KonvaEditorProps) {
  const [bgImage] = useImage(backgroundUrl || '', 'anonymous');

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    const clickedOnBackground = e.target.attrs?.id === 'background';
    if (clickedOnEmpty || clickedOnBackground) {
      setSelectedId(null);
    }
  };

  return (
    <div style={{ width: 400, height: 700 }}>
      <Stage
        width={400}
        height={700}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
        <Layer>
          {/* Fondo (Imagen o Color Plano) */}
          {bgImage ? (
            <KonvaImage
              id="background"
              image={bgImage}
              width={400}
              height={700}
              listening={true}
            />
          ) : (
            <Rect
              id="background"
              x={0}
              y={0}
              width={400}
              height={700}
              fill="#ffffff"
              listening={true}
            />
          )}

          {elements.map((el, i) => {
            if (el.type === 'image') {
              return (
                <CanvasImage
                  key={el.id}
                  shapeProps={el}
                  isSelected={el.id === selectedId}
                  onSelect={(e: any) => {
                    e.cancelBubble = true;
                    setSelectedId(el.id);
                  }}
                  onChange={(newAttrs: any) => {
                    const rects = elements.slice();
                    rects[i] = newAttrs;
                    setElements(rects);
                  }}
                />
              );
            }
            if (el.type === 'text') {
              return (
                <CanvasText
                  key={el.id}
                  shapeProps={el}
                  isSelected={el.id === selectedId}
                  onSelect={(e: any) => {
                    e.cancelBubble = true;
                    setSelectedId(el.id);
                  }}
                  onChange={(newAttrs: any) => {
                    const rects = elements.slice();
                    rects[i] = newAttrs;
                    setElements(rects);
                  }}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
}
