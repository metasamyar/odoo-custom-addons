# 🚀 Odoo Custom Addons
> **A curated collection of high-performance custom modules for Odoo 18.0+**

![Odoo Version](https://img.shields.io/badge/Odoo-18.0-purple?style=for-the-badge&logo=odoo)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-LGPL--3-blue?style=for-the-badge)

## 📂 Module Index

| Module Name | Version | Description | Links |
| :--- | :---: | :--- | :---: |
| **Project WBS Menu** | `18.0` | 🌳 **Deep Hierarchical Tree View** for Odoo Projects. Visualize tasks, sub-tasks, and infinite nesting in a single consolidated interface with a custom high-performance renderer. | [**View Repo**](https://github.com/metasamyar/project_wbs_menu) |
| **Discuss Web Push** | `18.0` | 🔔 **Native Web Push Notifications** for Odoo Discuss. Receive real-time browser notifications for messages and mentions even when the Odoo tab is closed. | [**View Repo**](https://github.com/metasamyar/Odoo-Discuss-Web-Push-Notifications) |

---

## 🌟 Highlights

### 🌳 [Project WBS Menu](https://github.com/metasamyar/project_wbs_menu)
* **Infinite Depth:** Recursively displays tasks $\rightarrow$ sub-tasks $\rightarrow$ sub-sub-tasks.
* **Fast Loading:** Uses a single RPC call to fetch the entire project structure instantly.
* **Custom UI:** A specialized OWL renderer that supports expand/collapse and project grouping.

### 🔔 [Odoo Discuss Web Push Notifications](https://github.com/metasamyar/Odoo-Discuss-Web-Push-Notifications)
* **Real-time Alerts:** Bridges Odoo Discuss with modern browser Push APIs.
* **Stay Connected:** Never miss a direct message or channel mention again.
* **Seamless Integration:** Works directly with the standard Odoo Discuss application.

---

## 📥 Installation Guide

You can manage these addons individually or as part of this collection.

### Method 1: Clone the Hub (Submodules)
If you want all modules at once and want to keep them updated:

```bash
# Clone this repository
git clone [https://github.com/metasamyar/odoo-custom-addons.git](https://github.com/metasamyar/odoo-custom-addons.git)
cd odoo-custom-addons

# Initialize submodules to pull the code
git submodule update --init --recursive