import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { 
    Headphones, Search, Menu, X, Music, Heart, Shuffle, 
    SkipBack, Play, Pause, SkipForward, Repeat, Mic2, 
    ListMusic, Volume2, VolumeX, Copy, Globe, RotateCcw, Check, Sparkles,
    Activity, Radio, Waves, Zap, Sliders, ChevronRight, Disc, Eye
} from 'lucide-react';
import "./App.css";

// --- Mock Data: The Music Universe ---
const musicData = {
    nodes: [
        // Genres (Planets) - Higher Radius
        { id: "Core", group: "hub", radius: 40, color: "#ffffff", title: "Music Universe", description: "The central nexus of all musical vibrations and galaxies." },
        { id: "Electronic", group: "genre", radius: 26, color: "#8b5cf6", title: "Electronic", description: "Synthesizers, electronic rhythms, and futuristic beatscapes." },
        { id: "Synthwave", group: "genre", radius: 25, color: "#ec4899", title: "Synthwave", description: "Neon-soaked 80s nostalgia with analog synth pads and retro drums." },
        { id: "Ambient", group: "genre", radius: 25, color: "#3b82f6", title: "Ambient", description: "Atmospheric, meditative textures focusing on timbre and space." },
        { id: "Lo-Fi", group: "genre", radius: 25, color: "#10b981", title: "Lo-Fi", description: "Chilled beats, vinyl crackles, and cozy relaxing melodies." },
        { id: "Rock", group: "genre", radius: 25, color: "#ef4444", title: "Rock", description: "Driving electric guitars, raw energy, and powerful percussion." },
        { id: "Jazz", group: "genre", radius: 25, color: "#f59e0b", title: "Jazz", description: "Sophisticated harmonies, syncopated rhythms, and expressive solos." },
        
        // Songs (Stars) - Smaller Radius, contains metadata
        { id: "s1", group: "song", radius: 10, color: "#fdf2f8", title: "Neon Nights", artist: "The Midnight", bpm: 110, energy: "High", mood: "Nostalgic", genre: "Synthwave", key: "C Minor", duration: "4:32" },
        { id: "s2", group: "song", radius: 8, color: "#fdf2f8", title: "Tech Noir", artist: "Gunship", bpm: 105, energy: "Medium", mood: "Dark", genre: "Synthwave", key: "D Minor", duration: "5:12" },
        { id: "s3", group: "song", radius: 12, color: "#fdf2f8", title: "Nightcall", artist: "Kavinsky", bpm: 90, energy: "Low", mood: "Mysterious", genre: "Synthwave", key: "A Minor", duration: "4:19" },
        { id: "s4", group: "song", radius: 7, color: "#fdf2f8", title: "Resonance", artist: "HOME", bpm: 85, energy: "Low", mood: "Chill", genre: "Synthwave", key: "E Major", duration: "3:32" },
        
        { id: "s5", group: "song", radius: 9, color: "#ecfdf5", title: "Coffee & Rain", artist: "City Girl", bpm: 75, energy: "Low", mood: "Relaxing", genre: "Lo-Fi", key: "G Major", duration: "2:45" },
        { id: "s6", group: "song", radius: 11, color: "#ecfdf5", title: "Snowman", artist: "WYS", bpm: 80, energy: "Low", mood: "Cozy", genre: "Lo-Fi", key: "Bb Major", duration: "3:10" },
        { id: "s7", group: "song", radius: 8, color: "#ecfdf5", title: "Autumn Leaves", artist: "Kupla", bpm: 72, energy: "Low", mood: "Melancholic", genre: "Lo-Fi", key: "F Minor", duration: "2:15" },
        
        { id: "s8", group: "song", radius: 14, color: "#eff6ff", title: "Weightless", artist: "Marconi Union", bpm: 60, energy: "Very Low", mood: "Calm", genre: "Ambient", key: "C Major", duration: "8:00" },
        { id: "s9", group: "song", radius: 10, color: "#eff6ff", title: "Xtal", artist: "Aphex Twin", bpm: 110, energy: "Medium", mood: "Ethereal", genre: "Ambient", key: "G Minor", duration: "4:54" },
        { id: "s10", group: "song", radius: 7, color: "#eff6ff", title: "Helios", artist: "Halving the Compass", bpm: 65, energy: "Low", mood: "Peaceful", genre: "Ambient", key: "A Major", duration: "5:26" },

        { id: "s11", group: "song", radius: 12, color: "#f5f3ff", title: "Strobe", artist: "deadmau5", bpm: 128, energy: "High", mood: "Euphoric", genre: "Electronic", key: "Eb Minor", duration: "10:37" },
        { id: "s12", group: "song", radius: 9, color: "#f5f3ff", title: "Innerbloom", artist: "RÜFÜS DU SOL", bpm: 122, energy: "Medium", mood: "Deep", genre: "Electronic", key: "G Minor", duration: "9:38" },
        
        { id: "s13", group: "song", radius: 11, color: "#fef2f2", title: "Everlong", artist: "Foo Fighters", bpm: 158, energy: "High", mood: "Energetic", genre: "Rock", key: "D Major", duration: "4:10" },
        { id: "s14", group: "song", radius: 9, color: "#fef2f2", title: "Karma Police", artist: "Radiohead", bpm: 75, energy: "Medium", mood: "Melancholic", genre: "Rock", key: "G Major", duration: "4:21" },
        
        { id: "s15", group: "song", radius: 13, color: "#fffbeb", title: "Take Five", artist: "Dave Brubeck", bpm: 174, energy: "Medium", mood: "Groovy", genre: "Jazz", key: "Eb Minor", duration: "5:24" },
        { id: "s16", group: "song", radius: 8, color: "#fffbeb", title: "So What", artist: "Miles Davis", bpm: 136, energy: "Low", mood: "Cool", genre: "Jazz", key: "D Minor", duration: "9:22" }
    ],
    links: [
        { source: "Core", target: "Electronic", value: 3 },
        { source: "Core", target: "Rock", value: 2 },
        { source: "Core", target: "Jazz", value: 2 },
        { source: "Electronic", target: "Synthwave", value: 2 },
        { source: "Electronic", target: "Ambient", value: 2 },
        { source: "Electronic", target: "Lo-Fi", value: 2 },
        { source: "Ambient", target: "Lo-Fi", value: 1 },
        { source: "Synthwave", target: "s1", value: 1 },
        { source: "Synthwave", target: "s2", value: 1 },
        { source: "Synthwave", target: "s3", value: 1 },
        { source: "Synthwave", target: "s4", value: 1 },
        { source: "s1", target: "s2", value: 0.5 },
        { source: "Lo-Fi", target: "s5", value: 1 },
        { source: "Lo-Fi", target: "s6", value: 1 },
        { source: "Lo-Fi", target: "s7", value: 1 },
        { source: "s5", target: "s7", value: 0.5 },
        { source: "Ambient", target: "s8", value: 1 },
        { source: "Ambient", target: "s9", value: 1 },
        { source: "Ambient", target: "s10", value: 1 },
        { source: "Electronic", target: "s11", value: 1 },
        { source: "Electronic", target: "s12", value: 1 },
        { source: "Rock", target: "s13", value: 1 },
        { source: "Rock", target: "s14", value: 1 },
        { source: "Jazz", target: "s15", value: 1 },
        { source: "Jazz", target: "s16", value: 1 },
    ]
};

// --- Visualizer Preset Configurations ---
const VISUALIZER_PRESETS = [
    {
        id: 'constellation',
        name: 'Cosmic Constellation',
        icon: Globe,
        desc: 'Interactive D3 force galaxy map with orbiting star systems',
        badge: 'Galaxy',
        color: '#a855f7'
    },
    {
        id: 'radar',
        name: 'Sonic Radial Radar',
        icon: Radio,
        desc: 'Pulsating circular frequency spectrum and harmonic resonance rings',
        badge: 'Radar',
        color: '#38bdf8'
    },
    {
        id: 'warp',
        name: 'Hyperspace Warp',
        icon: Zap,
        desc: 'High-speed lightspeed starfield tunnel reacting to track BPM',
        badge: 'Warp',
        color: '#ec4899'
    },
    {
        id: 'grid',
        name: 'Synthwave Cyber Grid',
        icon: Activity,
        desc: 'Neon 3D horizon with audio-reactive spectrum equalizer towers',
        badge: 'Cyber',
        color: '#f59e0b'
    },
    {
        id: 'vortex',
        name: 'Supernova Vortex',
        icon: Waves,
        desc: 'Swirling gravitational stardust vortex and flare bursts',
        badge: 'Vortex',
        color: '#10b981'
    }
];

// --- Web Audio API Synthesizer with Real-time Analyser ---
class WebAudioSynth {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.analyser = null;
        this.timer = null;
        this.isPlaying = false;
        this.noteIndex = 0;
        this.volume = 0.7;
        this.freqData = new Uint8Array(64);
        this.timeData = new Uint8Array(64);
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
                this.analyser = this.ctx.createAnalyser();
                this.analyser.fftSize = 128;
                this.analyser.smoothingTimeConstant = 0.82;
                
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
                
                this.masterGain.connect(this.analyser);
                this.analyser.connect(this.ctx.destination);
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
    }

    getFrequenciesForKey(keyStr) {
        const scaleMap = {
            "C Minor": [130.81, 155.56, 174.61, 196.00, 233.08, 261.63, 311.13, 349.23],
            "D Minor": [146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23, 392.00],
            "A Minor": [110.00, 130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66],
            "E Major": [164.81, 185.00, 207.65, 246.94, 277.18, 329.63, 369.99, 415.30],
            "G Major": [196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00, 493.88],
            "Bb Major": [116.54, 130.81, 146.83, 174.61, 196.00, 233.08, 261.63, 293.66],
            "F Minor": [174.61, 207.65, 233.08, 261.63, 311.13, 349.23, 415.30, 466.16],
            "C Major": [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 293.66, 329.63],
            "G Minor": [196.00, 233.08, 261.63, 293.66, 349.23, 392.00, 466.16, 523.25],
            "A Major": [220.00, 246.94, 277.18, 329.63, 369.99, 440.00, 493.88, 554.37],
            "Eb Minor": [155.56, 185.00, 207.65, 233.08, 277.18, 311.13, 369.99, 415.30],
            "D Major": [146.83, 164.81, 185.00, 220.00, 246.94, 293.66, 329.63, 369.99]
        };
        return scaleMap[keyStr] || [146.83, 174.61, 196.00, 220.00, 261.63, 293.66];
    }

    start(track) {
        this.init();
        this.stop();
        if (!this.ctx) return;

        this.isPlaying = true;
        const freqs = this.getFrequenciesForKey(track?.key);
        const bpm = track?.bpm || 100;
        const intervalMs = Math.max(250, (60 / bpm) * 1000 * 0.75);

        this.timer = setInterval(() => {
            if (!this.isPlaying || !this.ctx) return;
            
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                const freq = freqs[this.noteIndex % freqs.length];
                this.noteIndex = (this.noteIndex + Math.floor(Math.random() * 3 + 1)) % freqs.length;
                
                osc.type = track?.genre === 'Synthwave' ? 'sawtooth' : (track?.genre === 'Lo-Fi' ? 'triangle' : 'sine');
                osc.frequency.setValueAtTime(freq, now);
                
                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(500 + Math.random() * 700, now);
                
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.exponentialRampToValueAtTime(0.12, now + 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + (intervalMs / 1000) * 1.4);
                
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(this.masterGain);
                
                osc.start(now);
                osc.stop(now + (intervalMs / 1000) * 1.5);
            } catch {
                // Ignore web audio timing glitches
            }
        }, intervalMs);
    }

    stop() {
        this.isPlaying = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    getAudioData() {
        if (this.analyser && this.isPlaying) {
            if (this.freqData.length !== this.analyser.frequencyBinCount) {
                this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
                this.timeData = new Uint8Array(this.analyser.frequencyBinCount);
            }
            this.analyser.getByteFrequencyData(this.freqData);
            this.analyser.getByteTimeDomainData(this.timeData);
            
            let sum = 0;
            let bassSum = 0;
            let midSum = 0;
            let trebleSum = 0;
            const len = this.freqData.length;
            const quarter = Math.floor(len / 4);
            
            for (let i = 0; i < len; i++) {
                const val = this.freqData[i];
                sum += val;
                if (i < quarter) bassSum += val;
                else if (i < quarter * 3) midSum += val;
                else trebleSum += val;
            }
            
            return {
                freq: this.freqData,
                time: this.timeData,
                avg: sum / (len || 1),
                bass: bassSum / (quarter || 1),
                mid: midSum / (quarter * 2 || 1),
                treble: trebleSum / (quarter || 1)
            };
        }
        return { freq: null, time: null, avg: 0, bass: 0, mid: 0, treble: 0 };
    }
}

const synthInstance = new WebAudioSynth();

const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === null) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const parseDuration = (durStr) => {
    if (!durStr) return 180;
    const parts = durStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
};

// --- High Performance Audio-Reactive Space Visualizer Canvas Component ---
const SpaceVisualizer = ({ preset, isPlaying, currentTrack, progressPercent }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId;
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        // Pre-initialize particles for Warp preset
        const warpStars = Array.from({ length: 420 }, () => ({
            x: (Math.random() - 0.5) * width * 2,
            y: (Math.random() - 0.5) * height * 2,
            z: Math.random() * 1000 + 1,
            color: Math.random() > 0.4 ? '#a855f7' : (Math.random() > 0.5 ? '#38bdf8' : '#ec4899')
        }));

        // Pre-initialize particles for Vortex preset
        const vortexParticles = Array.from({ length: 360 }, (_, i) => ({
            angle: (i / 360) * Math.PI * 2 + Math.random() * 0.5,
            radius: Math.random() * Math.min(width, height) * 0.45 + 20,
            speed: (Math.random() * 0.006 + 0.003) * (Math.random() > 0.5 ? 1 : 1),
            size: Math.random() * 2.5 + 0.8,
            hueOffset: Math.random() * 60
        }));

        // Synthetic time trackers
        let tick = 0;
        let radarAngle = 0;
        let gridScroll = 0;

        const render = () => {
            tick++;
            const audio = synthInstance.getAudioData();
            const intensity = isPlaying ? Math.max(0.2, audio.avg / 128) : 0.15;
            const bassBoost = isPlaying ? Math.max(1, (audio.bass || 0) / 70) : 1;
            const cx = width / 2;
            const cy = height / 2;

            // Genre accent colors
            const trackColor = currentTrack?.color || '#a855f7';
            const genre = currentTrack?.genre || 'Space';

            if (preset === 'constellation') {
                // Subtle ambient stardust overlay for Galaxy Constellation mode
                ctx.clearRect(0, 0, width, height);
                
                if (isPlaying) {
                    const ambientRadius = 140 + Math.sin(tick * 0.04) * 20 + intensity * 60;
                    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, ambientRadius * 1.6);
                    grad.addColorStop(0, `${trackColor}18`);
                    grad.addColorStop(0.5, `${trackColor}08`);
                    grad.addColorStop(1, 'transparent');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(cx, cy, ambientRadius * 1.6, 0, Math.PI * 2);
                    ctx.fill();
                }
            } 
            else if (preset === 'radar') {
                // Sonic Radial Radar
                ctx.fillStyle = 'rgba(5, 5, 12, 0.28)';
                ctx.fillRect(0, 0, width, height);

                const baseR = Math.min(width, height) * 0.22;
                radarAngle += isPlaying ? 0.028 * bassBoost : 0.015;

                // Glowing background pulse
                const radGrad = ctx.createRadialGradient(cx, cy, baseR * 0.2, cx, cy, baseR * 1.8);
                radGrad.addColorStop(0, isPlaying ? 'rgba(56, 189, 248, 0.16)' : 'rgba(56, 189, 248, 0.05)');
                radGrad.addColorStop(0.6, 'rgba(168, 85, 247, 0.08)');
                radGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = radGrad;
                ctx.beginPath();
                ctx.arc(cx, cy, baseR * 1.8, 0, Math.PI * 2);
                ctx.fill();

                // Concentric Range Rings
                [0.4, 0.7, 1.0, 1.3].forEach((scale, idx) => {
                    const r = baseR * scale + (isPlaying ? Math.sin(tick * 0.05 + idx) * (intensity * 12) : 0);
                    ctx.strokeStyle = idx === 2 ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.12)';
                    ctx.lineWidth = idx === 2 ? 1.5 : 1;
                    ctx.setLineDash(idx % 2 === 1 ? [4, 6] : []);
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, 0, Math.PI * 2);
                    ctx.stroke();
                });
                ctx.setLineDash([]);

                // Rotating Radar Sweep
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(radarAngle);
                const sweepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseR * 1.4);
                sweepGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
                sweepGrad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
                ctx.fillStyle = sweepGrad;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, baseR * 1.4, 0, Math.PI * 0.35);
                ctx.closePath();
                ctx.fill();
                ctx.restore();

                // 360-Degree Radial Frequency Spectrum
                const barsCount = 64;
                const freqArr = audio.freq;
                for (let i = 0; i < barsCount; i++) {
                    const theta = (i / barsCount) * Math.PI * 2;
                    const val = freqArr ? (freqArr[i % freqArr.length] || 0) : (Math.sin(i * 0.4 + tick * 0.1) * 30 + 40);
                    const barHeight = (val / 255) * (baseR * 0.75) * (isPlaying ? 1.4 : 0.4);

                    const x1 = cx + Math.cos(theta) * baseR;
                    const y1 = cy + Math.sin(theta) * baseR;
                    const x2 = cx + Math.cos(theta) * (baseR + Math.max(4, barHeight));
                    const y2 = cy + Math.sin(theta) * (baseR + Math.max(4, barHeight));

                    ctx.strokeStyle = `hsl(${(i * 5 + tick * 2) % 360}, 85%, 65%)`;
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }

                // Central Sonic Core
                const coreR = 24 + intensity * 26;
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 24;
                ctx.beginPath();
                ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            else if (preset === 'warp') {
                // Hyperspace Warp Tunnel
                ctx.fillStyle = 'rgba(3, 3, 8, 0.32)';
                ctx.fillRect(0, 0, width, height);

                const bpm = currentTrack?.bpm || 110;
                const speed = (isPlaying ? (bpm * 0.12 + intensity * 28) : 3.5);

                for (let i = 0; i < warpStars.length; i++) {
                    const star = warpStars[i];
                    star.z -= speed;
                    if (star.z <= 0) {
                        star.z = 1000;
                        star.x = (Math.random() - 0.5) * width * 2;
                        star.y = (Math.random() - 0.5) * height * 2;
                    }

                    const k = 280 / star.z;
                    const px = star.x * k + cx;
                    const py = star.y * k + cy;

                    if (px >= 0 && px <= width && py >= 0 && py <= height) {
                        const prevK = 280 / (star.z + speed * 2.2);
                        const prevPx = star.x * prevK + cx;
                        const prevPy = star.y * prevK + cy;
                        const size = Math.max(0.8, (1 - star.z / 1000) * 3.5 * bassBoost);

                        ctx.strokeStyle = star.color;
                        ctx.lineWidth = size;
                        ctx.beginPath();
                        ctx.moveTo(prevPx, prevPy);
                        ctx.lineTo(px, py);
                        ctx.stroke();
                    }
                }

                // Warp central singularity flare
                if (isPlaying) {
                    const warpFlareR = 40 + intensity * 60;
                    const flareGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, warpFlareR);
                    flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                    flareGrad.addColorStop(0.3, 'rgba(236, 72, 153, 0.4)');
                    flareGrad.addColorStop(1, 'transparent');
                    ctx.fillStyle = flareGrad;
                    ctx.beginPath();
                    ctx.arc(cx, cy, warpFlareR, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            else if (preset === 'grid') {
                // Synthwave Cyber Grid
                ctx.fillStyle = 'rgba(5, 5, 14, 0.35)';
                ctx.fillRect(0, 0, width, height);

                const horizonY = height * 0.54;
                gridScroll = (gridScroll + (isPlaying ? 2.5 + intensity * 4 : 1.2)) % 40;

                // Glowing Synthwave Sun
                const sunRadius = Math.min(width, height) * 0.18;
                const sunGrad = ctx.createLinearGradient(cx, horizonY - sunRadius * 1.8, cx, horizonY);
                sunGrad.addColorStop(0, '#fef08a');
                sunGrad.addColorStop(0.4, '#f43f5e');
                sunGrad.addColorStop(1, '#8b5cf6');
                ctx.fillStyle = sunGrad;
                ctx.shadowColor = '#f43f5e';
                ctx.shadowBlur = 35;
                ctx.beginPath();
                ctx.arc(cx, horizonY, sunRadius, Math.PI, 0, false);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Sun horizontal blinds/scanline slits
                ctx.fillStyle = '#05050e';
                for (let y = horizonY - sunRadius * 0.85; y < horizonY; y += 7) {
                    const slitHeight = ((y - (horizonY - sunRadius)) / sunRadius) * 4.2;
                    ctx.fillRect(cx - sunRadius * 1.1, y, sunRadius * 2.2, slitHeight);
                }

                // Spectrum Equalizer Towers along Horizon
                const towers = 36;
                const towerWidth = (width * 0.75) / towers;
                const startX = width * 0.125;
                const freqArr = audio.freq;

                for (let i = 0; i < towers; i++) {
                    const rawVal = freqArr ? (freqArr[i % freqArr.length] || 0) : (Math.sin(i * 0.5 + tick * 0.08) * 40 + 50);
                    const towerH = (rawVal / 255) * (height * 0.28) * (isPlaying ? 1.3 : 0.3);
                    const tx = startX + i * towerWidth;

                    // Neon bar gradient
                    const barGrad = ctx.createLinearGradient(tx, horizonY - towerH, tx, horizonY);
                    barGrad.addColorStop(0, '#38bdf8');
                    barGrad.addColorStop(0.5, '#ec4899');
                    barGrad.addColorStop(1, '#a855f7');
                    ctx.fillStyle = barGrad;
                    ctx.fillRect(tx + 2, horizonY - towerH, towerWidth - 4, towerH);

                    // Floor reflection
                    const reflGrad = ctx.createLinearGradient(tx, horizonY, tx, horizonY + towerH * 0.4);
                    reflGrad.addColorStop(0, 'rgba(236, 72, 153, 0.3)');
                    reflGrad.addColorStop(1, 'transparent');
                    ctx.fillStyle = reflGrad;
                    ctx.fillRect(tx + 2, horizonY, towerWidth - 4, towerH * 0.4);
                }

                // 3D Grid Perspective Floor
                ctx.strokeStyle = 'rgba(236, 72, 153, 0.45)';
                ctx.lineWidth = 1.2;

                // Horizontal scrolling lines
                for (let d = 1; d < 18; d++) {
                    const norm = Math.pow(d / 18, 2.2);
                    const lineY = horizonY + norm * (height - horizonY) + (gridScroll * 0.3);
                    if (lineY > horizonY && lineY <= height) {
                        ctx.beginPath();
                        ctx.moveTo(0, lineY);
                        ctx.lineTo(width, lineY);
                        ctx.stroke();
                    }
                }

                // Converging vertical lines
                const gridColumns = 24;
                for (let i = -gridColumns; i <= gridColumns; i++) {
                    const bottomX = cx + (i * (width / 14));
                    ctx.beginPath();
                    ctx.moveTo(cx, horizonY);
                    ctx.lineTo(bottomX, height);
                    ctx.stroke();
                }
            }
            else if (preset === 'vortex') {
                // Supernova Particle Vortex
                ctx.fillStyle = 'rgba(4, 4, 10, 0.26)';
                ctx.fillRect(0, 0, width, height);

                const vortexSpeed = isPlaying ? 0.008 + intensity * 0.02 : 0.004;

                vortexParticles.forEach((p, idx) => {
                    p.angle += p.speed * (isPlaying ? 1.5 + intensity * 2 : 1);
                    p.radius -= isPlaying ? 0.35 + intensity * 0.8 : 0.2;

                    if (p.radius < 15) {
                        p.radius = Math.min(width, height) * 0.45;
                        p.angle = Math.random() * Math.PI * 2;
                    }

                    const px = cx + Math.cos(p.angle) * p.radius;
                    const py = cy + Math.sin(p.angle) * p.radius;
                    const pSize = p.size * (1 + intensity * 1.5);

                    ctx.fillStyle = `hsl(${(p.hueOffset + tick * 1.5 + (idx % 80)) % 360}, 90%, 65%)`;
                    ctx.shadowColor = '#ec4899';
                    ctx.shadowBlur = isPlaying ? 10 : 2;
                    ctx.beginPath();
                    ctx.arc(px, py, pSize, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.shadowBlur = 0;

                // Central Supernova Singularity
                const singR = 20 + intensity * 35;
                const singGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, singR * 2.2);
                singGrad.addColorStop(0, '#ffffff');
                singGrad.addColorStop(0.3, '#10b981');
                singGrad.addColorStop(0.7, '#3b82f6');
                singGrad.addColorStop(1, 'transparent');
                ctx.fillStyle = singGrad;
                ctx.beginPath();
                ctx.arc(cx, cy, singR * 2.2, 0, Math.PI * 2);
                ctx.fill();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, [preset, isPlaying, currentTrack, progressPercent]);

    return (
        <canvas 
            ref={canvasRef} 
            className="absolute inset-0 z-0 pointer-events-none w-full h-full"
        />
    );
};

// --- D3 Music Constellation Universe Graph Component ---
const MusicUniverse = ({ 
    data, 
    onNodeClick, 
    activeNodeId, 
    searchQuery, 
    resetTrigger,
    progressPercent = 0,
    isPlaying = false,
    explodingNodeId = null
}) => {
    const containerRef = useRef(null);
    const svgRef = useRef(null);
    const zoomRef = useRef(null);
    const nodesRef = useRef([]);
    const onNodeClickRef = useRef(onNodeClick);

    useEffect(() => {
        onNodeClickRef.current = onNodeClick;
    }, [onNodeClick]);

    useEffect(() => {
        if (!containerRef.current) return;

        const width = containerRef.current.clientWidth || window.innerWidth;
        const height = containerRef.current.clientHeight || window.innerHeight;

        d3.select(containerRef.current).selectAll("svg").remove();

        const svg = d3.select(containerRef.current)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "width: 100%; height: 100%; display: block;");

        svgRef.current = svg;

        const defs = svg.append("defs");
        
        // Planet glow
        const filterPlanet = defs.append("filter")
            .attr("id", "glow-planet")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");
        filterPlanet.append("feGaussianBlur").attr("stdDeviation", "12").attr("result", "coloredBlur");
        const feMergePlanet = filterPlanet.append("feMerge");
        feMergePlanet.append("feMergeNode").attr("in", "coloredBlur");
        feMergePlanet.append("feMergeNode").attr("in", "SourceGraphic");

        // Star glow
        const filterStar = defs.append("filter")
            .attr("id", "glow-star")
            .attr("x", "-50%")
            .attr("y", "-50%")
            .attr("width", "200%")
            .attr("height", "200%");
        filterStar.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
        const feMergeStar = filterStar.append("feMerge");
        feMergeStar.append("feMergeNode").attr("in", "coloredBlur");
        feMergeStar.append("feMergeNode").attr("in", "SourceGraphic");

        const g = svg.append("g");

        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });
        
        zoomRef.current = zoom;
        svg.call(zoom);
        svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.85));

        const nodes = data.nodes.map(d => ({...d}));
        const links = data.links.map(d => ({...d}));
        nodesRef.current = nodes;

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(d => {
                const sGroup = typeof d.source === 'object' ? d.source.group : null;
                const tGroup = typeof d.target === 'object' ? d.target.group : null;
                if (sGroup === 'hub' || tGroup === 'hub') return 180;
                if (sGroup === 'genre' && tGroup === 'genre') return 150;
                return 80;
            }))
            .force("charge", d3.forceManyBody().strength(d => d.group === 'hub' ? -1200 : (d.group === 'genre' ? -800 : -120)))
            .force("center", d3.forceCenter(0, 0))
            .force("collide", d3.forceCollide().radius(d => d.radius + 16).iterations(2));

        const link = g.append("g")
            .attr("stroke", "rgba(255,255,255,0.15)")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => Math.sqrt(d.value) * 1.5);

        const node = g.append("g")
            .selectAll("g")
            .data(nodes)
            .join("g")
            .attr("class", "node cursor-pointer")
            .attr("id", d => `node-${d.id}`)
            .call(d3.drag()
                .on("start", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0.3).restart();
                    d.fx = d.x; d.fy = d.y;
                })
                .on("drag", (event, d) => {
                    d.fx = event.x; d.fy = event.y;
                })
                .on("end", (event, d) => {
                    if (!event.active) simulation.alphaTarget(0);
                    d.fx = null; d.fy = null;
                }))
            .on("click", (event, d) => {
                event.stopPropagation();
                if (onNodeClickRef.current) {
                    onNodeClickRef.current(d);
                }
                
                const w = containerRef.current?.clientWidth || window.innerWidth;
                const h = containerRef.current?.clientHeight || window.innerHeight;
                svg.transition().duration(750).call(
                    zoom.transform, 
                    d3.zoomIdentity
                        .translate(w / 2 - (window.innerWidth > 768 ? 160 : 0), h / 2)
                        .scale(d.group === 'song' ? 1.5 : 1.1)
                        .translate(-d.x, -d.y)
                );
            });

        node.append("circle")
            .attr("r", d => d.radius)
            .attr("fill", d => d.group === 'song' ? '#fff' : d.color)
            .attr("stroke", d => d.group === 'song' ? d.color : 'transparent')
            .attr("stroke-width", d => d.group === 'song' ? 3 : 0)
            .attr("filter", d => {
                if (d.group === 'hub' || d.group === 'genre') return 'url(#glow-planet)';
                return 'url(#glow-star)';
            })
            .style("transition", "stroke-width 0.2s, stroke 0.2s, filter 0.2s, opacity 0.3s");

        node.append("text")
            .text(d => d.group === 'song' ? '' : d.title)
            .attr("x", 0)
            .attr("y", d => d.radius + 15)
            .attr("text-anchor", "middle")
            .attr("fill", "#e2e8f0")
            .attr("font-size", d => d.group === 'hub' ? "18px" : "14px")
            .attr("font-weight", "600")
            .style("text-shadow", "0 2px 4px rgba(0,0,0,0.8)")
            .style("pointer-events", "none");
            
        node.append("text")
            .text(d => d.group === 'song' ? d.title : '')
            .attr("x", 0)
            .attr("y", d => d.radius + 12)
            .attr("text-anchor", "middle")
            .attr("fill", "#94a3b8")
            .attr("font-size", "10px")
            .style("text-shadow", "0 2px 4px rgba(0,0,0,0.8)")
            .style("pointer-events", "none");

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        const handleResize = () => {
            if (!containerRef.current || !svgRef.current) return;
            const w = containerRef.current.clientWidth || window.innerWidth;
            const h = containerRef.current.clientHeight || window.innerHeight;
            svgRef.current.attr("width", w).attr("height", h).attr("viewBox", [0, 0, w, h]);
        };
        window.addEventListener('resize', handleResize);

        svg.on('click', () => {
            if (onNodeClickRef.current) {
                onNodeClickRef.current(null);
            }
        });

        return () => {
            window.removeEventListener('resize', handleResize);
            simulation.stop();
        };
    }, [data]);

    useEffect(() => {
        if (!resetTrigger || !svgRef.current || !containerRef.current || !zoomRef.current) return;
        const w = containerRef.current.clientWidth || window.innerWidth;
        const h = containerRef.current.clientHeight || window.innerHeight;
        svgRef.current.transition().duration(750).call(
            zoomRef.current.transform,
            d3.zoomIdentity.translate(w / 2, h / 2).scale(0.85)
        );
    }, [resetTrigger]);

    useEffect(() => {
        if (!svgRef.current) return;
        const svg = svgRef.current;

        svg.selectAll(".active-genre-wave").remove();

        svg.selectAll(".node")
            .filter(d => d.group === 'genre' || d.group === 'hub')
            .each(function(d) {
                const sel = d3.select(this);
                sel.select("circle")
                    .attr("r", d.radius)
                    .attr("fill", d.color)
                    .attr("stroke", "transparent")
                    .attr("stroke-width", 0)
                    .style("filter", isPlaying ? `drop-shadow(0 0 22px ${d.color})` : "url(#glow-planet)");

                sel.selectAll("text")
                    .attr("y", d.radius + 16);
            });

        if (!activeNodeId || !isPlaying) {
            svg.selectAll(".node")
                .filter(d => d.group === 'song')
                .each(function(d) {
                    const sel = d3.select(this);
                    sel.select("circle")
                        .attr("r", d.radius)
                        .attr("fill", "#ffffff")
                        .attr("stroke", d.color)
                        .attr("stroke-width", d.id === activeNodeId ? 5 : 3)
                        .style("filter", "url(#glow-star)");

                    sel.selectAll("text")
                        .attr("y", d.radius + 12)
                        .attr("fill", "#94a3b8")
                        .attr("font-size", "10px")
                        .style("text-shadow", "0 2px 4px rgba(0,0,0,0.8)");
                });
            return;
        }

        const progressRatio = Math.max(0, Math.min(1, (progressPercent || 0) / 100));

        const colorSpectrum = d3.scaleLinear()
            .domain([0, 0.25, 0.5, 0.75, 1.0])
            .range(["#38bdf8", "#a855f7", "#ec4899", "#f59e0b", "#ff0055"])
            .interpolate(d3.interpolateRgb);

        const activeColor = colorSpectrum(progressRatio);

        const activeNodeData = nodesRef.current.find(n => n.id === activeNodeId);
        const baseRadius = activeNodeData ? activeNodeData.radius : 10;
        const currentRadius = baseRadius + (baseRadius * 0.8 * progressRatio);

        if (activeNodeData && activeNodeData.genre) {
            const genreNodeData = nodesRef.current.find(n => n.group === 'genre' && n.title === activeNodeData.genre);
            if (genreNodeData) {
                const genreNodeEl = svg.select(`#node-${genreNodeData.id}`);
                if (!genreNodeEl.empty()) {
                    const waveColor = genreNodeData.color;
                    const baseR = genreNodeData.radius || 25;

                    genreNodeEl.select("circle")
                        .style("filter", `drop-shadow(0 0 35px ${waveColor})`);

                    genreNodeEl.append("circle")
                        .attr("class", "active-genre-wave genre-wave-ring-1")
                        .attr("cx", 0)
                        .attr("cy", 0)
                        .attr("stroke", waveColor)
                        .style("--wave-base-r", `${baseR}px`)
                        .style("filter", `drop-shadow(0 0 10px ${waveColor})`);

                    genreNodeEl.append("circle")
                        .attr("class", "active-genre-wave genre-wave-ring-2")
                        .attr("cx", 0)
                        .attr("cy", 0)
                        .attr("stroke", waveColor)
                        .style("--wave-base-r", `${baseR}px`)
                        .style("filter", `drop-shadow(0 0 10px ${waveColor})`);
                }
            }
        }

        svg.selectAll(".node")
            .filter(d => d.group === 'song' && d.id !== activeNodeId)
            .each(function(d) {
                const sel = d3.select(this);
                sel.select("circle")
                    .attr("r", d.radius)
                    .attr("fill", "#ffffff")
                    .attr("stroke", d.color)
                    .attr("stroke-width", 3);

                sel.selectAll("text")
                    .attr("y", d.radius + 12)
                    .attr("fill", "#94a3b8")
                    .attr("font-size", "10px");
            });

        const activeNodeEl = svg.select(`#node-${activeNodeId}`);
        if (!activeNodeEl.empty()) {
            activeNodeEl.select("circle")
                .attr("r", currentRadius)
                .attr("fill", activeColor)
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 4)
                .style("filter", `drop-shadow(0 0 24px ${activeColor})`);

            activeNodeEl.selectAll("text")
                .attr("y", currentRadius + 14)
                .attr("fill", "#ffffff")
                .attr("font-weight", "700")
                .attr("font-size", `${Math.min(13, 10 + (progressRatio * 3))}px`)
                .style("text-shadow", `0 2px 8px ${activeColor}, 0 0 12px rgba(0,0,0,0.9)`);
        }
    }, [activeNodeId, progressPercent, isPlaying]);

    useEffect(() => {
        if (!explodingNodeId || !svgRef.current) return;

        const svg = svgRef.current;
        const nodeEl = svg.select(`#node-${explodingNodeId}`);
        if (nodeEl.empty()) return;

        const nodeData = nodesRef.current.find(n => n.id === explodingNodeId);
        if (!nodeData || nodeData.group !== 'song') return;

        const parentG = svg.select("g");
        const x = nodeData.x || 0;
        const y = nodeData.y || 0;
        const baseRadius = nodeData.radius || 10;
        const blastRadius = baseRadius * 3.0;

        nodeEl.select("circle")
            .transition().duration(250)
            .attr("r", blastRadius)
            .attr("fill", "#ff0055")
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 6)
            .style("filter", "drop-shadow(0 0 40px #ff0055)")
            .transition().duration(650)
            .attr("r", baseRadius)
            .attr("fill", "#ffffff")
            .attr("stroke", nodeData.color)
            .attr("stroke-width", 3);

        nodeEl.selectAll("text")
            .transition().duration(250)
            .attr("y", blastRadius + 16)
            .attr("fill", "#ff0055")
            .attr("font-size", "13px")
            .transition().duration(650)
            .attr("y", baseRadius + 12)
            .attr("fill", "#94a3b8")
            .attr("font-size", "10px");

        const shockwave = parentG.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", baseRadius * 1.5)
            .attr("fill", "none")
            .attr("stroke", "#ff0055")
            .attr("stroke-width", 8)
            .attr("opacity", 1);

        shockwave.transition().duration(850).ease(d3.easeQuadOut)
            .attr("r", baseRadius + 110)
            .attr("stroke-width", 0)
            .attr("opacity", 0)
            .remove();

        const shockwave2 = parentG.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", baseRadius * 1.2)
            .attr("fill", "none")
            .attr("stroke", "#fbbf24")
            .attr("stroke-width", 5)
            .attr("opacity", 0.9);

        shockwave2.transition().duration(950).ease(d3.easeCubicOut)
            .attr("r", baseRadius + 75)
            .attr("stroke-width", 0)
            .attr("opacity", 0)
            .remove();

        const particleCount = 24;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + (Math.random() * 0.4);
            const dist = baseRadius + 30 + Math.random() * 85;
            const targetX = x + Math.cos(angle) * dist;
            const targetY = y + Math.sin(angle) * dist;

            const particle = parentG.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", Math.random() * 3 + 1.5)
                .attr("fill", i % 2 === 0 ? "#ff0055" : (i % 3 === 0 ? "#fbbf24" : "#ffffff"))
                .attr("opacity", 1);

            particle.transition().duration(750 + Math.random() * 200).ease(d3.easeCubicOut)
                .attr("cx", targetX)
                .attr("cy", targetY)
                .attr("r", 0.5)
                .attr("opacity", 0)
                .remove();
        }
    }, [explodingNodeId]);

    useEffect(() => {
        if (!svgRef.current) return;
        const query = searchQuery.trim().toLowerCase();
        
        svgRef.current.selectAll(".node")
            .style("opacity", d => {
                if (!query) return 1;
                const matchTitle = d.title && d.title.toLowerCase().includes(query);
                const matchArtist = d.artist && d.artist.toLowerCase().includes(query);
                const matchGenre = d.genre && d.genre.toLowerCase().includes(query);
                const matchMood = d.mood && d.mood.toLowerCase().includes(query);
                return (matchTitle || matchArtist || matchGenre || matchMood) ? 1 : 0.25;
            });
    }, [searchQuery]);

    return (
        <div ref={containerRef} className="absolute inset-0 z-0 cursor-move" />
    );
};

export default function App() {
    const [selectedNode, setSelectedNode] = useState(null);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSeconds, setCurrentSeconds] = useState(0);
    const [totalSeconds, setTotalSeconds] = useState(0);
    
    // Extra interactive states
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [isShuffle, setIsShuffle] = useState(false);
    const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
    const [favorites, setFavorites] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [copiedToast, setCopiedToast] = useState(false);
    const [resetViewTrigger, setResetViewTrigger] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [explodingNodeId, setExplodingNodeId] = useState(null);

    // Visualizer preset state
    const [visualizerPreset, setVisualizerPreset] = useState('constellation');
    const [isPresetMenuOpen, setIsPresetMenuOpen] = useState(false);
    const presetMenuRef = useRef(null);

    // Available songs
    const songNodes = useMemo(() => musicData.nodes.filter(n => n.group === 'song'), []);

    // Filtered search results for top bar dropdown
    const searchResults = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return [];
        return musicData.nodes.filter(n => {
            const matchTitle = n.title && n.title.toLowerCase().includes(query);
            const matchArtist = n.artist && n.artist.toLowerCase().includes(query);
            const matchGenre = n.genre && n.genre.toLowerCase().includes(query);
            const matchMood = n.mood && n.mood.toLowerCase().includes(query);
            return matchTitle || matchArtist || matchGenre || matchMood;
        }).slice(0, 6);
    }, [searchQuery]);

    // Handle Volume changes
    useEffect(() => {
        synthInstance.setVolume(isMuted ? 0 : volume);
    }, [volume, isMuted]);

    // Web Audio Synthesizer playback sync
    useEffect(() => {
        if (isPlaying && currentTrack) {
            synthInstance.start(currentTrack);
        } else {
            synthInstance.stop();
        }
        return () => {
            synthInstance.stop();
        };
    }, [isPlaying, currentTrack]);

    // Close preset menu on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (presetMenuRef.current && !presetMenuRef.current.contains(e.target)) {
                setIsPresetMenuOpen(false);
            }
        };
        if (isPresetMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPresetMenuOpen]);

    const playTrack = useCallback((track) => {
        setCurrentTrack(track);
        setTotalSeconds(parseDuration(track.duration));
        setCurrentSeconds(0);
        setIsPlaying(true);
    }, []);

    const handleNextTrack = useCallback(() => {
        if (!songNodes.length) return;
        let nextTrack = null;

        if (isShuffle) {
            const randomIndex = Math.floor(Math.random() * songNodes.length);
            nextTrack = songNodes[randomIndex];
        } else if (currentTrack) {
            const currentIndex = songNodes.findIndex(s => s.id === currentTrack.id);
            if (currentIndex !== -1 && currentIndex < songNodes.length - 1) {
                nextTrack = songNodes[currentIndex + 1];
            } else if (repeatMode === 'all') {
                nextTrack = songNodes[0];
            }
        } else {
            nextTrack = songNodes[0];
        }

        if (nextTrack) {
            playTrack(nextTrack);
            setSelectedNode(nextTrack);
        } else {
            setIsPlaying(false);
            setCurrentSeconds(0);
        }
    }, [currentTrack, songNodes, isShuffle, repeatMode, playTrack]);

    const handleSongEnd = useCallback(() => {
        if (!currentTrack) return;

        const explodingId = currentTrack.id;
        setExplodingNodeId(explodingId);
        setIsPlaying(false);

        setTimeout(() => {
            setExplodingNodeId(null);
            if (repeatMode === 'one') {
                setCurrentSeconds(0);
                setIsPlaying(true);
            } else {
                handleNextTrack();
            }
        }, 950);
    }, [currentTrack, repeatMode, handleNextTrack]);

    // Timer interval for playback
    useEffect(() => {
        let interval = null;
        if (isPlaying && currentTrack) {
            interval = setInterval(() => {
                setCurrentSeconds(prev => {
                    if (prev >= totalSeconds) {
                        handleSongEnd();
                        return 0;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentTrack, totalSeconds, handleSongEnd]);

    const handlePrevTrack = useCallback(() => {
        if (!songNodes.length) return;
        if (currentSeconds > 3) {
            setCurrentSeconds(0);
            return;
        }

        let prevTrack = null;
        if (currentTrack) {
            const currentIndex = songNodes.findIndex(s => s.id === currentTrack.id);
            if (currentIndex > 0) {
                prevTrack = songNodes[currentIndex - 1];
            } else {
                prevTrack = songNodes[songNodes.length - 1];
            }
        } else {
            prevTrack = songNodes[0];
        }

        if (prevTrack) {
            playTrack(prevTrack);
            setSelectedNode(prevTrack);
        }
    }, [currentTrack, songNodes, currentSeconds, playTrack]);

    const handleNodeSelect = useCallback((node) => {
        setSelectedNode(node);
    }, []);

    const handlePlaySequence = () => {
        if (!selectedNode) return;
        if (selectedNode.group === 'song') {
            playTrack(selectedNode);
        } else if (selectedNode.group === 'genre') {
            const genreSong = songNodes.find(s => s.genre === selectedNode.title);
            if (genreSong) {
                playTrack(genreSong);
                setSelectedNode(genreSong);
            }
        } else {
            if (songNodes.length > 0) {
                playTrack(songNodes[0]);
                setSelectedNode(songNodes[0]);
            }
        }
    };

    const togglePlayPause = () => {
        if (!currentTrack) {
            const firstSong = songNodes[0];
            if (firstSong) {
                playTrack(firstSong);
                setSelectedNode(firstSong);
            }
            return;
        }
        setIsPlaying(!isPlaying);
    };

    const toggleFavorite = (trackId) => {
        setFavorites(prev => {
            const next = new Set(prev);
            if (next.has(trackId)) {
                next.delete(trackId);
            } else {
                next.add(trackId);
            }
            return next;
        });
    };

    const handleProgressBarClick = (e) => {
        if (!currentTrack || totalSeconds <= 0) return;
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percent = Math.max(0, Math.min(1, clickX / rect.width));
        setCurrentSeconds(Math.floor(percent * totalSeconds));
    };

    const handleCopyDetails = () => {
        if (!selectedNode) return;
        const textToCopy = selectedNode.group === 'song'
            ? `🎵 ${selectedNode.title} by ${selectedNode.artist} (${selectedNode.genre} | ${selectedNode.bpm} BPM | Key: ${selectedNode.key})`
            : `🪐 Galaxy Region: ${selectedNode.title} - ${selectedNode.description || 'SoundSpace Galaxy'}`;
        
        navigator.clipboard.writeText(textToCopy);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2000);
    };

    const toggleRepeatMode = () => {
        if (repeatMode === 'off') setRepeatMode('all');
        else if (repeatMode === 'all') setRepeatMode('one');
        else setRepeatMode('off');
    };

    // Cycle through presets sequentially
    const handleCyclePreset = () => {
        const currentIndex = VISUALIZER_PRESETS.findIndex(p => p.id === visualizerPreset);
        const nextIndex = (currentIndex + 1) % VISUALIZER_PRESETS.length;
        setVisualizerPreset(VISUALIZER_PRESETS[nextIndex].id);
    };

    const currentPresetObj = useMemo(() => {
        return VISUALIZER_PRESETS.find(p => p.id === visualizerPreset) || VISUALIZER_PRESETS[0];
    }, [visualizerPreset]);

    const progressPercent = totalSeconds > 0 ? (currentSeconds / totalSeconds) * 100 : 0;
    const connectedSongs = useMemo(() => {
        if (!selectedNode || selectedNode.group === 'song') return [];
        if (selectedNode.group === 'genre') {
            return songNodes.filter(s => s.genre === selectedNode.title);
        }
        return songNodes;
    }, [selectedNode, songNodes]);

    return (
        <div className="h-screen w-screen flex flex-col font-sans relative text-sm sm:text-base bg-[#05050A] text-slate-200 overflow-hidden select-none">
            
            <div className="stars-bg"></div>

            {/* Audio-Reactive Space Visualizer Canvas Engine */}
            <SpaceVisualizer 
                preset={visualizerPreset} 
                isPlaying={isPlaying} 
                currentTrack={currentTrack} 
                progressPercent={progressPercent} 
            />
            
            {/* Main Interactive D3 Graph Component */}
            <div className={`transition-opacity duration-700 ${visualizerPreset === 'constellation' ? 'opacity-100 pointer-events-auto' : 'opacity-25 pointer-events-none'}`}>
                <MusicUniverse 
                    data={musicData} 
                    onNodeClick={handleNodeSelect} 
                    activeNodeId={currentTrack?.id} 
                    searchQuery={searchQuery}
                    resetTrigger={resetViewTrigger}
                    progressPercent={progressPercent}
                    isPlaying={isPlaying}
                    explodingNodeId={explodingNodeId}
                />
            </div>

            {/* Top Navigation */}
            <nav className="glass-panel w-full px-4 sm:px-6 py-3 flex justify-between items-center z-10 absolute top-0 left-0 border-b border-white/10 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                        <Headphones className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-none flex items-center gap-2">
                            SoundSpace <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                        </h1>
                        <p className="text-xs text-slate-400 hidden sm:block mt-0.5">Explore Music as an Interactive Universe</p>
                    </div>
                </div>
                
                {/* Search and Quick Controls */}
                <div className="flex items-center gap-3">
                    {/* Visualizer Preset Quick Badge in Header */}
                    <button
                        onClick={handleCyclePreset}
                        title="Click to cycle visualizer presets"
                        className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-all shadow-sm group"
                    >
                        <currentPresetObj.icon className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
                        <span className="font-medium">{currentPresetObj.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                            {currentPresetObj.badge}
                        </span>
                    </button>

                    <div className="relative group">
                        <div className="flex items-center bg-[#0A0A14]/80 border border-white/10 rounded-full py-1.5 px-3 text-sm text-white focus-within:border-purple-500/80 transition-colors w-48 sm:w-64 shadow-inner">
                            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                placeholder="Search galaxies & songs..." 
                                className="bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder:text-slate-500 w-full"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white p-0.5 ml-1">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Search Dropdown Results */}
                        {isSearchFocused && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0F0F1D]/95 border border-white/10 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <p className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1 tracking-wider">Matching Constellations</p>
                                {searchResults.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setSelectedNode(item);
                                            if (item.group === 'song') {
                                                playTrack(item);
                                            }
                                        }}
                                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 flex items-center justify-between transition-colors group"
                                    >
                                        <div className="truncate">
                                            <p className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors truncate">{item.title}</p>
                                            <p className="text-xs text-slate-400 truncate">{item.artist || item.genre || item.group}</p>
                                        </div>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-purple-300 font-mono">
                                            {item.group}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => setResetViewTrigger(prev => prev + 1)}
                        title="Reset Camera View"
                        className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>

                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="w-9 h-9 rounded-full bg-white/5 flex md:hidden items-center justify-center hover:bg-white/10 text-slate-300 transition-colors border border-white/5"
                    >
                        <Menu className="w-4 h-4" />
                    </button>
                </div>
            </nav>

            {/* Toast Notification */}
            {copiedToast && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-purple-600 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                    <Check className="w-4 h-4" /> Link & Track Info Copied!
                </div>
            )}

            {/* Detail Side Panel */}
            <aside 
                className={`glass-panel absolute right-0 top-0 h-full w-full md:w-80 lg:w-96 z-20 flex flex-col shadow-2xl border-l border-white/10 pt-20 pb-24 transition-transform duration-500 ease-out ${
                    selectedNode ? 'translate-x-0' : 'translate-x-full'
                } max-md:bottom-20 max-md:top-auto max-md:h-[60vh] max-md:rounded-t-3xl max-md:border-t max-md:border-l-0 ${
                    selectedNode ? 'max-md:translate-y-0' : 'max-md:translate-y-full'
                }`}
            >
                <button 
                    onClick={() => setSelectedNode(null)}
                    className="absolute top-4 right-4 md:top-24 md:right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-300 transition-colors z-30 border border-white/5"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-6 flex-1 overflow-y-auto">
                    {selectedNode ? (
                        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            
                            {/* Header details */}
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 inline-block mb-2">
                                        {selectedNode.group === 'song' ? 'Star System' : 'Galaxy Realm'}
                                    </span>
                                    <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{selectedNode.title}</h2>
                                    <p className="text-purple-300 font-medium text-sm">
                                        {selectedNode.artist || selectedNode.description || selectedNode.group}
                                    </p>
                                </div>
                                <button 
                                    onClick={handleCopyDetails}
                                    title="Copy track details"
                                    className="text-slate-400 hover:text-white transition p-2 bg-white/5 rounded-full hover:bg-white/10 border border-white/5"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent my-1"></div>
                            
                            {/* Metadata Grid */}
                            {selectedNode.group === 'song' ? (
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-slate-400 text-[10px] uppercase tracking-widest mb-1 font-semibold">BPM</span>
                                        <span className="font-medium text-white text-base">{selectedNode.bpm}</span>
                                    </div>
                                    <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-slate-400 text-[10px] uppercase tracking-widest mb-1 font-semibold">Energy</span>
                                        <span className="font-medium text-white text-base">{selectedNode.energy}</span>
                                    </div>
                                    <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-slate-400 text-[10px] uppercase tracking-widest mb-1 font-semibold">Mood</span>
                                        <span className="font-medium text-white text-base">{selectedNode.mood}</span>
                                    </div>
                                    <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-slate-400 text-[10px] uppercase tracking-widest mb-1 font-semibold">Genre</span>
                                        <span className="font-medium text-purple-300 text-base">{selectedNode.genre}</span>
                                    </div>
                                    <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-slate-400 text-[10px] uppercase tracking-widest mb-1 font-semibold">Key</span>
                                        <span className="font-medium text-white text-base">{selectedNode.key}</span>
                                    </div>
                                    <div className="flex flex-col bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-slate-400 text-[10px] uppercase tracking-widest mb-1 font-semibold">Duration</span>
                                        <span className="font-medium text-white text-base">{selectedNode.duration}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 text-sm">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <p className="text-xs text-slate-300 leading-relaxed">
                                            {selectedNode.description || "Connected constellation in the music space universe."}
                                        </p>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                                        <span className="text-xs text-slate-400">Connected Stars</span>
                                        <span className="text-sm font-bold text-purple-400">{connectedSongs.length} Tracks</span>
                                    </div>
                                </div>
                            )}

                            {/* Play Action Button */}
                            <div className="mt-2 flex justify-center">
                                <button 
                                    onClick={() => {
                                        if (selectedNode.group === 'song' && currentTrack?.id === selectedNode.id) {
                                            togglePlayPause();
                                        } else {
                                            handlePlaySequence();
                                        }
                                    }}
                                    className="group flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 text-white px-8 py-3.5 rounded-full font-bold hover:scale-[1.03] active:scale-95 transition-all shadow-[0_0_22px_rgba(236,72,153,0.5)] hover:shadow-[0_0_32px_rgba(168,85,247,0.8)] border border-white/20 w-full"
                                >
                                    {isPlaying && currentTrack?.id === selectedNode?.id ? (
                                        <>
                                            <Pause className="w-5 h-5 fill-white text-white drop-shadow" />
                                            <span>Pause Track</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5 fill-white text-white ml-0.5 drop-shadow" />
                                            <span>{selectedNode.group === 'song' ? 'Play Star Track' : 'Play Galaxy Sequence'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            {/* Connected Stars list */}
                            {connectedSongs.length > 0 && selectedNode.group !== 'song' && (
                                <div className="mt-2 p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <h3 className="text-xs text-slate-400 uppercase tracking-widest mb-3 font-semibold flex items-center gap-2">
                                        <Music className="w-3.5 h-3.5 text-purple-400" /> Orbiting Tracks
                                    </h3>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {connectedSongs.map((song) => (
                                            <div 
                                                key={song.id}
                                                onClick={() => {
                                                    playTrack(song);
                                                    setSelectedNode(song);
                                                }}
                                                className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                                    currentTrack?.id === song.id 
                                                        ? 'bg-purple-600/20 border-purple-500/50 text-white' 
                                                        : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                                                }`}
                                            >
                                                <div className="truncate">
                                                    <p className="font-semibold truncate">{song.title}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">{song.artist}</p>
                                                </div>
                                                <span className="text-[10px] text-purple-300 font-mono ml-2">{song.duration}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Constellation stats widget */}
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
                                <h3 className="text-xs text-slate-400 uppercase tracking-widest mb-3 font-semibold flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5 text-purple-400" /> Constellation Resonance
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400">Atmospheric Density</span>
                                        <span className="text-purple-300 font-medium">94.8%</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full w-[94.8%]"></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                <Globe className="w-8 h-8 opacity-50 text-purple-400" />
                            </div>
                            <p className="text-sm">Select a star or galaxy planet to explore its musical spectrum.</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Bottom Audio Player Controls Bar */}
            <div className="glass-panel w-full h-20 absolute bottom-0 left-0 z-30 flex items-center px-4 sm:px-8 justify-between border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
                
                {/* Now Playing Info */}
                <div className="flex items-center gap-3 w-1/3 min-w-[140px]">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-900 to-[#0A0A14] hidden sm:flex items-center justify-center border border-white/10 shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors"></div>
                        <Music className="w-5 h-5 text-purple-400 relative z-10 animate-bounce-slow" />
                    </div>
                    <div className="truncate flex-1">
                        <h4 className="text-white font-semibold truncate text-sm sm:text-base leading-tight">
                            {currentTrack ? currentTrack.title : "No sequence selected"}
                        </h4>
                        <p className="text-xs text-purple-300/80 truncate mt-0.5">
                            {currentTrack ? `${currentTrack.artist} • ${currentTrack.genre}` : "Explore the universe"}
                        </p>
                    </div>
                    {currentTrack && (
                        <button 
                            onClick={() => toggleFavorite(currentTrack.id)}
                            className="text-slate-400 hover:text-pink-500 transition hidden lg:block ml-1 p-2"
                        >
                            <Heart className={`w-5 h-5 ${favorites.has(currentTrack.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                        </button>
                    )}
                </div>

                {/* Player Controls Center */}
                <div className="flex flex-col items-center justify-center w-1/3 flex-1 max-w-xl px-2">
                    <div className="flex items-center gap-3 sm:gap-6 mb-1.5">
                        <button 
                            onClick={() => setIsShuffle(!isShuffle)}
                            title="Shuffle mode"
                            className={`transition p-1 ${isShuffle ? 'text-purple-400' : 'text-slate-500 hover:text-white'}`}
                        >
                            <Shuffle className="w-4 h-4" />
                        </button>
                        
                        <button 
                            onClick={handlePrevTrack}
                            title="Previous track"
                            className="text-slate-300 hover:text-white transition p-1 hover:scale-110 active:scale-95"
                        >
                            <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                        </button>
                        
                        <button 
                            onClick={togglePlayPause}
                            title={isPlaying ? "Pause Track" : "Play Track"}
                            className={`hover:scale-110 active:scale-95 transition-all transform flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 text-white border-2 border-white/40 hover:border-white shadow-[0_0_22px_rgba(236,72,153,0.6)] hover:shadow-[0_0_32px_rgba(168,85,247,0.9)] relative ${
                                isPlaying ? 'ring-4 ring-purple-500/30 animate-pulse-slow' : ''
                            }`}
                        >
                            {isPlaying ? 
                                <Pause className="w-6 h-6 fill-white text-white drop-shadow" /> : 
                                <Play className="w-6 h-6 fill-white text-white ml-0.5 drop-shadow" />
                            }
                        </button>
                        
                        <button 
                            onClick={handleNextTrack}
                            title="Next track"
                            className="text-slate-300 hover:text-white transition p-1 hover:scale-110 active:scale-95"
                        >
                            <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                        </button>
                        
                        <button 
                            onClick={toggleRepeatMode}
                            title={`Repeat: ${repeatMode}`}
                            className={`transition p-1 relative ${repeatMode !== 'off' ? 'text-purple-400' : 'text-slate-500 hover:text-white'}`}
                        >
                            <Repeat className="w-4 h-4" />
                            {repeatMode === 'one' && (
                                <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-purple-600 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center">1</span>
                            )}
                        </button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                        <span className="w-8 text-right tabular-nums">{formatTime(currentSeconds)}</span>
                        <div 
                            className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden cursor-pointer group relative"
                            onClick={handleProgressBarClick}
                        >
                            <div 
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative transition-all duration-300 ease-linear"
                                style={{ width: `${progressPercent}%` }}
                            >
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                        <span className="w-8 tabular-nums">{currentTrack ? currentTrack.duration : '--:--'}</span>
                    </div>
                </div>

                {/* Extra Controls */}
                <div className="w-1/3 flex justify-end items-center gap-3 sm:gap-4 text-slate-400">
                    
                    {/* Visualizer Preset Button & Popover */}
                    <div className="relative" ref={presetMenuRef}>
                        <button 
                            title={`Visualizer Preset: ${currentPresetObj.name}`}
                            onClick={() => setIsPresetMenuOpen(prev => !prev)}
                            className={`transition-all p-2 rounded-xl relative flex items-center gap-1.5 ${
                                isPresetMenuOpen 
                                    ? 'text-purple-300 bg-purple-500/20 ring-1 ring-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                                    : 'hover:text-white hover:bg-white/10 text-slate-300'
                            }`}
                        >
                            <currentPresetObj.icon className="w-4 h-4 text-purple-400 animate-pulse" />
                            <span className="hidden xl:inline text-xs font-semibold text-white/90">{currentPresetObj.badge}</span>
                            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 animate-ping absolute -top-0.5 -right-0.5"></span>
                            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 absolute -top-0.5 -right-0.5"></span>
                        </button>

                        {/* Preset Menu Popover Modal */}
                        {isPresetMenuOpen && (
                            <div className="absolute bottom-full right-0 mb-3 w-80 bg-[#0C0C1A]/95 border border-white/15 rounded-3xl p-3.5 shadow-[0_-10px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
                                <div className="flex items-center justify-between px-2 py-1 mb-2 border-b border-white/10 pb-2">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-purple-400" />
                                        <span className="text-xs uppercase font-bold text-slate-200 tracking-wider">Visualizer Presets</span>
                                    </div>
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-medium">
                                        {VISUALIZER_PRESETS.length} Modes
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    {VISUALIZER_PRESETS.map((p) => {
                                        const IconComponent = p.icon;
                                        const isActive = visualizerPreset === p.id;
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setVisualizerPreset(p.id);
                                                    setIsPresetMenuOpen(false);
                                                }}
                                                className={`w-full text-left p-2.5 rounded-2xl flex items-center gap-3 transition-all group ${
                                                    isActive 
                                                        ? 'bg-gradient-to-r from-purple-900/60 to-pink-900/40 border border-purple-500/50 shadow-md' 
                                                        : 'hover:bg-white/5 border border-transparent'
                                                }`}
                                            >
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                                    isActive 
                                                        ? 'bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.7)]' 
                                                        : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-purple-300'
                                                }`}>
                                                    <IconComponent className="w-4 h-4" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                                                            {p.name}
                                                        </p>
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono ml-1">
                                                            {p.badge}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                                        {p.desc}
                                                    </p>
                                                </div>

                                                {isActive && (
                                                    <div className="w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]"></div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 px-2">
                                    <span>Tip: Click header badge to cycle</span>
                                    <button 
                                        onClick={handleCyclePreset}
                                        className="text-purple-400 hover:text-purple-300 font-semibold transition"
                                    >
                                        Next Mode &rarr;
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button 
                        title="Star Queue" 
                        onClick={() => selectedNode ? setSelectedNode(null) : setSelectedNode(currentTrack || songNodes[0])}
                        className="hover:text-white transition p-2 hover:bg-white/5 rounded-xl"
                    >
                        <ListMusic className="w-4 h-4" />
                    </button>
                    
                    {/* Volume Control */}
                    <div className="flex items-center gap-2 w-24 sm:w-28 p-1 group">
                        <button 
                            onClick={() => setIsMuted(!isMuted)}
                            className="hover:text-white transition"
                        >
                            {isMuted || volume === 0 ? (
                                <VolumeX className="w-4 h-4 text-red-400" />
                            ) : (
                                <Volume2 className="w-4 h-4 group-hover:text-purple-400 transition" />
                            )}
                        </button>
                        <input 
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={(e) => {
                                setVolume(parseFloat(e.target.value));
                                if (isMuted) setIsMuted(false);
                            }}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}