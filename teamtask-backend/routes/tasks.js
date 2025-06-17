//routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');

// Toutes les routes nécessitent authentification
router.use(authMiddleware);

// 📊 GET /api/tasks/stats - Statistiques globales
router.get('/stats', async (req, res) => {
  try {
    const total = await Task.countDocuments();
    const byStatus = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    res.json({ total, byStatus });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🔎 GET /api/tasks?status=X - Filtrage par statut
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.user.role !== 'manager') {
      filter.assignedTo = req.user.userId;
    }
    const tasks = await Task.find(filter).populate('assignedTo', 'username email');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 👥 GET /api/tasks/by-user - Groupement par utilisateur (manager uniquement)
router.get('/by-user', async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Accès refusé' });

  try {
    const results = await Task.aggregate([
      {
        $group: {
          _id: "$assignedTo",
          count: { $sum: 1 },
          tasks: { $push: "$$ROOT" }
        }
      }
    ]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /api/tasks - Créer une tâche (manager uniquement)
router.post('/', async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Accès refusé' });

  const { title, description, status, assignedTo } = req.body;
  if (!title || !assignedTo) return res.status(400).json({ message: 'Titre et utilisateur assigné obligatoires' });

  try {
    const task = new Task({ title, description, status, assignedTo });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// PUT /api/tasks/:id - Modifier une tâche
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, status, assignedTo } = req.body;

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });

    if (req.user.role !== 'manager' && task.assignedTo.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    if (req.user.role === 'manager') {
      if (title) task.title = title;
      if (description) task.description = description;
      if (status) task.status = status;
      if (assignedTo) task.assignedTo = assignedTo;
    } else {
      if (status) task.status = status;
    }

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

const mongoose = require('mongoose');

router.delete('/:id', async (req, res) => {
  // Vérification stricte des permissions
  if (req.user?.role !== 'manager') {
    return res.status(403).json({ 
      success: false,
      message: 'Action réservée aux managers'
    });
  }

  // Validation rigoureuse de l'ID
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'ID de tâche invalide'
    });
  }

  try {
    // Solution garantie sans .remove()
    const result = await Task.deleteOne({ 
      _id: new mongoose.Types.ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Tâche supprimée avec succès',
      deletedId: req.params.id
    });

  } catch (error) {
    console.error('Erreur critique DELETE:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date()
    });
    
    res.status(500).json({
      success: false,
      message: 'Erreur technique lors de la suppression',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
module.exports = router;
