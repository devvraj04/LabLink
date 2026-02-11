import React, { useEffect, useRef } from 'react';

const BloodFlowBackground = () => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];
        let tubes = [];

        // Configuration
        const TUBE_COUNT = 15;
        const PARTICLE_COUNT = 80;
        const CONNECTION_DISTANCE = 150;
        const MOUSE_RADIUS = 200;

        class Tube {
            constructor(w, h) {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2 + 1;
            }

            update(w, h) {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > w) this.vx *= -1;
                if (this.y < 0 || this.y > h) this.vy *= -1;
            }
        }

        class Particle {
            constructor(w, h) {
                this.reset(w, h);
            }

            reset(w, h) {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.size = Math.random() * 3 + 1;
                this.speedX = (Math.random() - 0.5) * 1;
                this.speedY = (Math.random() - 0.5) * 1;
                this.life = Math.random() * 100 + 100;
                this.maxLife = this.life;
                this.opacity = Math.random() * 0.5 + 0.2;
            }

            update(w, h, mouseX, mouseY) {
                this.x += this.speedX;
                this.y += this.speedY;
                this.life--;

                // Mouse interaction
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < MOUSE_RADIUS) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
                    const directionX = forceDirectionX * force * 0.5;
                    const directionY = forceDirectionY * force * 0.5;
                    this.x -= directionX;
                    this.y -= directionY;
                }

                if (this.life <= 0 || this.x < 0 || this.x > w || this.y < 0 || this.y > h) {
                    this.reset(w, h);
                }
            }

            draw(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(220, 20, 60, ${this.opacity})`; // Crimson red
                ctx.fill();
            }
        }

        const init = () => {
            const { width, height } = containerRef.current.getBoundingClientRect();
            canvas.width = width;
            canvas.height = height;

            tubes = [];
            particles = [];

            for (let i = 0; i < TUBE_COUNT; i++) {
                tubes.push(new Tube(width, height));
            }

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle(width, height));
            }
        };

        const drawTubes = (ctx, w, h) => {
            ctx.strokeStyle = 'rgba(20, 184, 166, 0.1)'; // Teal, very faint
            ctx.lineWidth = 1;

            for (let i = 0; i < tubes.length; i++) {
                const tubeA = tubes[i];
                tubeA.update(w, h);

                // Connect tubes nearby
                for (let j = i + 1; j < tubes.length; j++) {
                    const tubeB = tubes[j];
                    const dx = tubeA.x - tubeB.x;
                    const dy = tubeA.y - tubeB.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < CONNECTION_DISTANCE) {
                        ctx.beginPath();
                        ctx.moveTo(tubeA.x, tubeA.y);
                        ctx.bezierCurveTo(
                            tubeA.x + dx * 0.5, tubeA.y,
                            tubeB.x - dx * 0.5, tubeB.y,
                            tubeB.x, tubeB.y
                        );
                        ctx.stroke();
                    }
                }

                // Draw nodes
                ctx.beginPath();
                ctx.arc(tubeA.x, tubeA.y, tubeA.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(13, 148, 136, 0.2)'; // Teal dot
                ctx.fill();
            }
        };

        const animate = () => {
            const { width, height } = canvas;
            ctx.clearRect(0, 0, width, height);

            // Draw background gradient essentially handled by parent CSS, 
            // but we add a subtle overlay

            // Draw connecting tubes (The "Laboratory" feel)
            drawTubes(ctx, width, height);

            // Draw flowing blood particles
            particles.forEach(p => {
                p.update(width, height, mouseRef.current.x, mouseRef.current.y);
                p.draw(ctx);

                // Connect particles to nearby tubes for "interaction"
                tubes.forEach(t => {
                    const dx = p.x - t.x;
                    const dy = p.y - t.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(t.x, t.y);
                        ctx.strokeStyle = `rgba(220, 20, 60, ${0.05 * (1 - dist / 100)})`;
                        ctx.stroke();
                    }
                });
            });

            // Draw Mouse Cursor Effect (The "Pint" cursor glow)
            const gradient = ctx.createRadialGradient(
                mouseRef.current.x, mouseRef.current.y, 0,
                mouseRef.current.x, mouseRef.current.y, 150
            );
            gradient.addColorStop(0, 'rgba(20, 184, 166, 0.1)'); // Teal glow center
            gradient.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(mouseRef.current.x, mouseRef.current.y, 150, 0, Math.PI * 2);
            ctx.fill();

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            init();
        };

        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        init();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950">
            {/* SVG Overlay for "Tubes" feel */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            />
        </div>
    );
};

export default BloodFlowBackground;
