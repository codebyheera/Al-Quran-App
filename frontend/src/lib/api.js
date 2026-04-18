/**
 * lib/api.js — Shared Axios instance
 *
 * In development:  VITE_API_URL is not set, so BASE is '' (empty string).
 *                  Vite's dev proxy rewrites /api/* → http://localhost:5000/api/*
 *
 * In production:   VITE_API_URL is set to the deployed backend URL, e.g.
 *                  https://api.alquranhub.org
 *                  All /api/* calls are prefixed with that URL.
 */

import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL ?? '';

const api = axios.create({ baseURL: BASE });

export default api;
