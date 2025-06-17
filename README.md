#  TeamTask

TeamTask est une application de gestion de tâches collaborative développée avec la stack **MERN** (MongoDB, Express.js, React, Node.js) et **Redux Toolkit**. Elle permet à une équipe d'organiser son travail grâce à une interface simple, avec gestion des rôles (`User` et `Manager`) et authentification sécurisée via **JWT**.

---

##  Fonctionnalités principales

### Authentification
- Inscription et connexion sécurisées (JWT)
- Gestion des rôles : `User` et `Manager`
- Middleware Express protégeant les routes sensibles
- Stockage du token dans le localStorage (frontend)

###  Gestion des utilisateurs
- Les **users** peuvent :
  - Voir leurs propres tâches
  - Mettre à jour le **statut** de leurs tâches

- Les **managers** peuvent :
  - Créer, assigner, modifier, supprimer toutes les tâches
  - Voir toutes les tâches du système

###  Gestion des tâches
- CRUD complet (Create, Read, Update, Delete)
- Champs : `title`, `description`, `status`, `assignedTo`
- Statuts : `à faire`, `en cours`, `terminée`
- Filtrage par statut
- Statistiques globales & groupement par utilisateur (manager)

---

##  Architecture

###  Backend
- Node.js + Express
- MongoDB avec Mongoose
- JWT pour l’authentification
- Modèles :
  - `User`: { username, email, password, role }
  - `Task`: { title, description, status, assignedTo }

###  Frontend
- React + Redux Toolkit
- Pages :
  - Connexion
  - Inscription
  - Dashboard avec filtre
  - (Optionnel) Vue Manager : tous les utilisateurs et statistiques

---

## Installation

### Prérequis
- Node.js ≥ 18
- MongoDB local ou cloud (ex: MongoDB Atlas)

###  Cloner et installer

```bash
git clone https://github.com/sadok-slama/teamtask.git
cd teamtask

### Backend

```bash
cd backend
npm install
# Créer un fichier .env avec les variables suivantes :
# MONGO_URI=ton_url_mongodb
# JWT_SECRET=ta_clé_secrète
npm start


### Frontend

bash
Copier
Modifier
cd ../frontend
npm install
npm start



##  Routes Backend
| Méthode | URL                  | Description                    | Accès        |
| ------- | -------------------- | ------------------------------ | ------------ |
| GET     | `/api/tasks`         | Liste des tâches               | User/Manager |
| POST    | `/api/tasks`         | Créer une tâche                | Manager      |
| PUT     | `/api/tasks/:id`     | Modifier état d une tâche      | User/Manager |
| DELETE  | `/api/tasks/:id`     | Supprimer une tâche            | Manager      |
| GET     | `/api/tasks/stats`   | Statistiques globales          | Manager      |
| GET     | `/api/tasks/by-user` | Groupement des tâches par user | Manager      |
