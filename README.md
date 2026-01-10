# 🚀 3C Gadget Hub - Modern E-commerce Platform

A high-performance E-commerce platform specialized in IT products and gaming gadgets, built using **Laravel 11**, **React (Inertia.js)**, and **Tailwind CSS**. This project delivers a premium shopping experience with integrated gamification and advanced configuration tools.

---

## ✨ Key Features

- 🖥️ **Synergy Loadout (PC Builder):** An interactive system to build custom PC configurations with real-time synergy scoring and compatibility insights.
- 🎮 **Gamification System:** Engaging user experience with XP points, levels, and achievements based on user activity.
- 🛒 **Full E-commerce Suite:** Dynamic product catalog, multi-criteria filtering, and a streamlined checkout process.
- 💳 **Secure Payments:** Integrated with **Stripe** and **PromptPay QR** for versatile and secure transactions.
- 🔔 **Real-time Updates:** Live notifications and status updates via **Laravel Echo** and **Pusher**.
- 🎨 **Premium UI/UX:** Fully responsive design with smooth animations powered by **Framer Motion** and **Lucide React** icons.
- 📊 **Advanced Admin Panel:** Complete control over inventory, orders, analytical reports, and system settings.

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | [Laravel 11](https://laravel.com) |
| **Frontend** | [React](https://reactjs.org), [Inertia.js](https://inertiajs.com) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com), [Framer Motion](https://www.framer.com/motion/) |
| **Database** | MySQL |
| **Payment** | Stripe, PromptPay |
| **Tooling** | Vite, PHPUnit, Composer, NPM |

## 📦 Installation & Setup

### 1. Prerequisites
- PHP 8.2+
- Composer
- Node.js & NPM
- MySQL

### 2. Installation Steps

1. **Clone & Enter Directory**
   ```bash
   git clone https://github.com/Imalonxe/3c-gadget-hub.git
   cd 3c-gadget-hub
   ```

2. **Install Backend Dependencies**
   ```bash
   composer install
   ```

3. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   *Note: configure your `.env` with database and Stripe/Pusher credentials.*

5. **Database Migration & Seeding**
   ```bash
   php artisan migrate --seed
   ```

### 3. Running the Application

```bash
# For Development (Hot Reload)
npm run dev

# For Production
npm run build
php artisan serve
```

---
Developed by **นาย คุณานนต์ ปัทมาภา**
