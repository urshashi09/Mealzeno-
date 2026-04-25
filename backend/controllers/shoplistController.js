import shoppingList from "../models/shoppingList.js";
import PDFDocument from "pdfkit";



export const generateFromMealPlan = async (req, res, next) => {
    try {
        const {startDate, endDate}= req.body;

        if(!startDate || !endDate){
            return res.status(400).json({
                success: false,
                message: "Start date and end date are required"
            })
        }

        const items= await shoppingList.generateFromMealPlan(req.user.id, startDate, endDate);

        res.status(200).json({
            success: true,
            message: "Shopping list generated successfully",
            data: {items}
        });
    }   catch (error) {
        next(error);
    }
}



export const getShoppingList = async (req, res, next) => {
    try {
        const grouped= req.query.grouped === 'true';

        const items= grouped ? 
        await shoppingList.getGroupedByCategory(req.user.id) 
        : await shoppingList.findByUserId(req.user.id);


        res.status(200).json({
            success: true,
            message: "Shopping list retrieved successfully",
            data: {items}
        });
    }
        catch (error) { 
        next(error);
    }
}


export const addItem = async (req, res, next) => {
    try {
        const item= await shoppingList.create(req.user.id, req.body);

        res.status(201).json({  
            success: true,
            message: "Item added to shopping list successfully",
            data: {item}
        });
    }   catch (error) {
        next(error);
    }
}


export const updateItem = async (req, res, next) => {
    try {
        const {id}= req.params;
        const item= await shoppingList.update(id, req.user.id, req.body);

        if(!item){
            return res.status(404).json({
                success: false,
                message: "Item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Item updated successfully",
            data: {item}
        });
    }   catch (error) {
        next(error);
    }
}


export const toggleChecked = async (req, res, next) => {
    try {
        const {id}= req.params;
        const item= await shoppingList.toggleChecked(id, req.user.id);

        if(!item){
            return res.status(404).json({
                success: false,
                message: "Item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Item checked status toggled successfully",
            data: {item}
        });
    }   catch (error) {
        next(error);
    }
}



export const deleteItem = async (req, res, next) => {
    try {
        const {id}= req.params;
        const item= await shoppingList.delete(id, req.user.id);

        if(!item){
            return res.status(404).json({
                success: false,
                message: "Item not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Item deleted successfully",
            data: {item}
        });
    }   catch (error) {
        next(error);
    }
}


export const clearChecked = async (req, res, next) => {
    try {
        const items= await shoppingList.clearChecked(req.user.id);

        res.status(200).json({
            success: true,
            message: "Checked items cleared successfully",
            data: {items}
        });
    }   catch (error) {
        next(error);
    }
}


export const clearAll = async (req, res, next) => {
    try {
        const items= await shoppingList.clearAll(req.user.id);

        res.status(200).json({
            success: true,
            message: "All items cleared successfully",
            data: {items}
        });
    }   catch (error) {
        next(error);
    }
}


export const addCheckedToPantry = async (req, res, next) => {
    try {
        const items= await shoppingList.addCheckedItemsToPantry(req.user.id);

        res.status(200).json({
            success: true,
            message: "Checked items added to pantry successfully",
            data: {items}
        });
    }   catch (error) {
        next(error);
    }
}


export const downloadShoppingListPDF = async (req, res, next) => {
    try {
        // Fetch all items and filter to unchecked only
        const allItems = await shoppingList.findByUserId(req.user.id);
        const unchecked = allItems.filter(item => !item.is_checked);

        if (unchecked.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No unchecked items to download'
            });
        }

        // Group unchecked items by category
        const grouped = {};
        unchecked.forEach(item => {
            const cat = item.category || 'Other';
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(item);
        });

        // Build PDF
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=shopping-list.pdf');
        doc.pipe(res);

        // ── Title ──
        doc.font('Helvetica-Bold')
            .fontSize(24)
            .fillColor('#1a1a1a')
            .text('Shopping List', { align: 'left' });

        // ── Date subtitle ──
        const dateStr = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        doc.moveDown(0.3)
            .font('Helvetica')
            .fontSize(11)
            .fillColor('#666666')
            .text(dateStr, { align: 'left' });

        // ── Divider ──
        doc.moveDown(0.8)
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .strokeColor('#e0e0e0')
            .lineWidth(1)
            .stroke();

        doc.moveDown(0.8);

        // ── Categories & Items ──
        const categories = Object.keys(grouped).sort();
        categories.forEach((category, catIndex) => {
            // Category heading
            doc.font('Helvetica-Bold')
                .fontSize(13)
                .fillColor('#2d6a4f')
                .text(category.toUpperCase());

            doc.moveDown(0.4);

            // Items under this category
            grouped[category].forEach(item => {
                const qty  = item.quantity != null ? item.quantity : '';
                const unit = item.unit ? ` ${item.unit}` : '';
                const detail = qty !== '' ? `(${qty}${unit})` : '';

                doc.font('Helvetica').fontSize(11).fillColor('#1a1a1a');

                // Draw checkbox square
                const x = 50;
                const y = doc.y;
                doc.rect(x, y + 1, 10, 10)
                    .strokeColor('#999999')
                    .lineWidth(0.8)
                    .stroke();

                // Item name (continued if there's a detail)
                doc.text(`  ${item.ingredient_name}`, x + 16, y, { continued: detail !== '' });
                if (detail) {
                    doc.font('Helvetica')
                        .fillColor('#888888')
                        .text(`  ${detail}`, { continued: false });
                }

                doc.moveDown(0.35);
            });

            // Spacing between categories (skip after last)
            if (catIndex < categories.length - 1) {
                doc.moveDown(0.6);
            }
        });

        // ── Footer ──
        doc.moveDown(1.5)
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .strokeColor('#e0e0e0')
            .lineWidth(0.5)
            .stroke()
            .moveDown(0.4)
            .font('Helvetica')
            .fontSize(9)
            .fillColor('#aaaaaa')
            .text(
                `Generated by MEALZENO · ${unchecked.length} item${unchecked.length !== 1 ? 's' : ''}`,
                { align: 'center' }
            );

        doc.end();
    } catch (error) {
        next(error);
    }
};
