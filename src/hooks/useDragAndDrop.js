/**
 * useDragAndDrop Hook
 * 
 * Custom drag-and-drop implementation using native HTML5 Drag & Drop API.
 * No external dependencies needed.
 * 
 * Handles reordering of items in a list with visual feedback.
 */
import { useState, useCallback, useRef } from "react";

export default function useDragAndDrop(items, onReorder) {
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const dragRef = useRef(null);

  const handleDragStart = useCallback((e, index) => {
    setDragIndex(index);
    dragRef.current = index;
    e.dataTransfer.effectAllowed = "move";
    // Set a transparent drag image for custom styling
    const elem = e.target;
    if (elem) {
      e.dataTransfer.setDragImage(elem, elem.offsetWidth / 2, elem.offsetHeight / 2);
    }
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverIndex(index);
  }, []);

  const handleDragEnter = useCallback((e, index) => {
    e.preventDefault();
    setOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    // Don't clear overIndex here to prevent flickering
  }, []);

  const handleDrop = useCallback((e, dropIndex) => {
    e.preventDefault();
    const fromIndex = dragRef.current;
    if (fromIndex === null || fromIndex === dropIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }

    // Create reordered copy
    const reordered = [...items];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    onReorder(reordered);
    setDragIndex(null);
    setOverIndex(null);
    dragRef.current = null;
  }, [items, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
    dragRef.current = null;
  }, []);

  /**
   * Returns props to spread onto each draggable item element.
   * Usage: <div {...getDragProps(index)} />
   */
  const getDragProps = useCallback((index) => ({
    draggable: true,
    onDragStart: (e) => handleDragStart(e, index),
    onDragOver: (e) => handleDragOver(e, index),
    onDragEnter: (e) => handleDragEnter(e, index),
    onDragLeave: handleDragLeave,
    onDrop: (e) => handleDrop(e, index),
    onDragEnd: handleDragEnd,
  }), [handleDragStart, handleDragOver, handleDragEnter, handleDragLeave, handleDrop, handleDragEnd]);

  return {
    dragIndex,
    overIndex,
    getDragProps,
  };
}
