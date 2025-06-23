document.addEventListener('DOMContentLoaded', function() {
    // Initialize Fabric.js canvas
    const canvas = new fabric.Canvas('animation-canvas', {
        backgroundColor: '#ffffff',
        preserveObjectStacking: true
    });

    // Set canvas size to fit container
    function resizeCanvas() {
        const container = document.querySelector('.canvas-container');
        canvas.setWidth(container.offsetWidth - 40);
        canvas.setHeight(Math.min(600, window.innerHeight - 200));
        canvas.renderAll();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Sidebar functionality
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.toggle-icon');
            
            if (content.style.display === 'none' || !content.style.display) {
                content.style.display = 'flex';
                icon.textContent = '-';
            } else {
                content.style.display = 'none';
                icon.textContent = '+';
            }
        });
    });

    // Asset items click handler
    const assetItems = document.querySelectorAll('.asset-item');
    assetItems.forEach(item => {
        item.addEventListener('click', () => {
            const type = item.getAttribute('data-type');
            const src = item.querySelector('.asset-preview').getAttribute('data-src');
            
            // For demo purposes, we'll create rectangles instead of actual images
            // In a real app, you would load the actual SVG/image assets here
            let fabricObj;
            
            if (type === 'character') {
                fabricObj = new fabric.Rect({
                    width: 100,
                    height: 150,
                    fill: '#4285f4',
                    left: 100,
                    top: 100,
                    stroke: '#333',
                    strokeWidth: 1,
                    rx: 10,
                    ry: 10,
                    name: 'Character: ' + src
                });
            } else if (type === 'background') {
                fabricObj = new fabric.Rect({
                    width: canvas.width,
                    height: canvas.height,
                    fill: '#e0e0e0',
                    left: 0,
                    top: 0,
                    selectable: false,
                    name: 'Background: ' + src,
                    lockMovementX: true,
                    lockMovementY: true,
                    lockRotation: true,
                    lockScalingX: true,
                    lockScalingY: true
                });
            } else { // object
                fabricObj = new fabric.Circle({
                    radius: 50,
                    fill: '#34a853',
                    left: 100,
                    top: 100,
                    stroke: '#333',
                    strokeWidth: 1,
                    name: 'Object: ' + src
                });
            }
            
            canvas.add(fabricObj);
            canvas.setActiveObject(fabricObj);
            canvas.renderAll();
            updatePropertiesPanel();
        });
    });

    // Add Text button
    document.getElementById('add-text-btn').addEventListener('click', () => {
        const text = new fabric.Textbox('Double click to edit', {
            left: 100,
            top: 100,
            width: 150,
            fontSize: 20,
            fill: '#333',
            fontFamily: 'Roboto',
            name: 'Text'
        });
        
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
        updatePropertiesPanel();
    });

    // Reset button
    document.getElementById('reset-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the canvas?')) {
            canvas.clear();
            canvas.backgroundColor = '#ffffff';
            canvas.renderAll();
            updatePropertiesPanel();
        }
    });

    // Export PNG button
    document.getElementById('export-png-btn').addEventListener('click', () => {
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1
        });
        
        const link = document.createElement('a');
        link.download = 'animation.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Export GIF button
    document.getElementById('export-gif-btn').addEventListener('click', () => {
        alert('GIF export would be implemented with gif.js in a real application');
        // In a real app, you would:
        // 1. Capture multiple canvas states (frames)
        // 2. Use gif.js to compile them into an animated GIF
        // 3. Provide download link for the GIF
    });

    // Properties Panel functionality
    function updatePropertiesPanel() {
        const activeObject = canvas.getActiveObject();
        const controls = document.getElementById('property-controls');
        
        if (!activeObject) {
            controls.querySelectorAll('input, button').forEach(el => {
                el.disabled = true;
            });
            return;
        }
        
        controls.querySelectorAll('input, button').forEach(el => {
            el.disabled = false;
        });
        
        // Update position inputs
        document.getElementById('pos-x').value = Math.round(activeObject.left);
        document.getElementById('pos-y').value = Math.round(activeObject.top);
        
        // Update size inputs
        if (activeObject.width && activeObject.height) {
            document.getElementById('width').value = Math.round(activeObject.width);
            document.getElementById('height').value = Math.round(activeObject.height);
        } else if (activeObject.radius) {
            document.getElementById('width').value = Math.round(activeObject.radius * 2);
            document.getElementById('height').value = Math.round(activeObject.radius * 2);
        }
        
        // Update color picker if object has fill property
        if (activeObject.fill) {
            document.getElementById('color-picker').value = rgbToHex(activeObject.fill);
        }
    }

    // Helper function to convert fabric color to hex
    function rgbToHex(color) {
        if (color && color.toHex) {
            return color.toHex();
        }
        return '#000000';
    }

    // Position inputs event listeners
    document.getElementById('pos-x').addEventListener('change', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.set('left', parseInt(this.value));
            canvas.renderAll();
        }
    });

    document.getElementById('pos-y').addEventListener('change', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.set('top', parseInt(this.value));
            canvas.renderAll();
        }
    });

    // Size inputs event listeners
    document.getElementById('width').addEventListener('change', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            if (activeObject.radius) {
                activeObject.set('radius', parseInt(this.value) / 2);
            } else {
                activeObject.set('width', parseInt(this.value));
            }
            canvas.renderAll();
        }
    });

    document.getElementById('height').addEventListener('change', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            if (activeObject.radius) {
                activeObject.set('radius', parseInt(this.value) / 2);
            } else {
                activeObject.set('height', parseInt(this.value));
            }
            canvas.renderAll();
        }
    });

    // Color picker event listener
    document.getElementById('color-picker').addEventListener('change', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject && activeObject.set) {
            activeObject.set('fill', this.value);
            canvas.renderAll();
        }
    });

    // Layer order buttons
    document.getElementById('bring-forward').addEventListener('click', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.bringForward();
            canvas.renderAll();
        }
    });

    document.getElementById('send-backward').addEventListener('click', function() {
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            activeObject.sendBackwards();
            canvas.renderAll();
        }
    });

    // Canvas selection event
    canvas.on('selection:created', updatePropertiesPanel);
    canvas.on('selection:updated', updatePropertiesPanel);
    canvas.on('selection:cleared', updatePropertiesPanel);

    // Drawing tools functionality
    let isDrawing = false;
    let currentTool = 'pencil';
    let brushSize = 5;
    let brushColor = '#000000';

    // Tool buttons
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(button => {
        button.addEventListener('click', function() {
            toolButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentTool = this.getAttribute('data-tool');
            canvas.isDrawingMode = currentTool !== 'fill';
            
            if (currentTool === 'fill') {
                canvas.selection = true;
            }
        });
    });

    // Brush size slider
    const brushSizeSlider = document.getElementById('brush-size');
    const brushSizeValue = document.getElementById('brush-size-value');
    brushSizeSlider.addEventListener('input', function() {
        brushSize = parseInt(this.value);
        brushSizeValue.textContent = brushSize;
        
        if (canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.width = brushSize;
        }
    });

    // Brush color picker
    const brushColorPicker = document.getElementById('brush-color');
    brushColorPicker.addEventListener('input', function() {
        brushColor = this.value;
        
        if (canvas.freeDrawingBrush) {
            canvas.freeDrawingBrush.color = brushColor;
        }
    });

    // Initialize drawing tools
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.color = brushColor;

    // Tool change handler
    function setDrawingTool() {
        switch (currentTool) {
            case 'pencil':
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                break;
            case 'brush':
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                canvas.freeDrawingBrush.shadow = new fabric.Shadow({
                    blur: 10,
                    offsetX: 0,
                    offsetY: 0,
                    affectStroke: true,
                    color: brushColor
                });
                break;
            case 'eraser':
                canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
                canvas.freeDrawingBrush.color = '#ffffff';
                break;
        }
        
        canvas.freeDrawingBrush.width = brushSize;
        if (currentTool !== 'eraser') {
            canvas.freeDrawingBrush.color = brushColor;
        }
    }

    // Fill tool functionality
    canvas.on('mouse:down', function(options) {
        if (currentTool === 'fill' && options.target) {
            options.target.set('fill', brushColor);
            canvas.renderAll();
        }
    });

    // Update properties panel when objects are modified
    canvas.on('object:modified', updatePropertiesPanel);

    // Initialize properties panel
    updatePropertiesPanel();
});
