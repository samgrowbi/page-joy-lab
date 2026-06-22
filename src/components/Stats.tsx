import { useEffect, useRef } from "react";
import { motion, useInView, animate } from "motion/react";
import { ShieldCheck, Layers } from "lucide-react";

function Counter({ from = 0, to }: { from?: number; to: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: "-10%" });

  useEffect(() => {
    if (!isInView) return;

    const node = nodeRef.current;
    const controls = animate(from, to, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(value) {
        if (node) node.textContent = Math.round(value).toString();
      },
    });

    return () => controls.stop();
  }, [from, to, isInView]);

  return <span ref={nodeRef} />;
}

export function Stats() {
  const stats = [
    {
      percentage: "98%",
      feature: "WRINKLES",
      description: "OF USERS reported improvement"
    },
    {
      percentage: "95%",
      feature: "PORE SIZE",
      description: "OF USERS reported improvement"
    },
    {
      percentage: "91%",
      feature: "SKIN TEXTURE",
      description: "OF USERS reported improvement"
    },
    {
      percentage: "89%",
      feature: "SKIN PIGMENT",
      description: "OF USERS reported improvement"
    }
  ];

  return (
    <section className="pt-20 pb-12 bg-gradient-to-b from-white to-pink-50/30" dir="ltr">
      <div className="container mx-auto px-5">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 max-w-3xl mx-auto"
        >
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 leading-tight mb-6">
                Clinically Tested to Treat Multiple Signs of Aging
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <div className="flex items-center gap-2.5 bg-white rounded-full px-5 py-3 shadow-sm border border-gray-100">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 text-sm font-medium">Clinically tested</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white rounded-full px-5 py-3 shadow-sm border border-gray-100">
                <Layers className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 text-sm font-medium">Safe for all skin types and tones</span>
              </div>
            </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white p-8 rounded-3xl shadow-lg shadow-pink-100/30 border border-pink-100/50 flex flex-col items-center justify-center text-center group hover:border-pink-200 hover:shadow-xl hover:shadow-pink-200/40 hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="relative mb-4">
                        <div className="absolute inset-0 bg-pink-100 blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-full" />
                        <span className="relative text-5xl md:text-6xl font-bold bg-gradient-to-br from-pink-500 to-rose-600 bg-clip-text text-transparent block transform group-hover:scale-110 transition-transform duration-300 font-sans">
                            <Counter to={parseInt(stat.percentage)} />%
                        </span>
                    </div>

                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                        {stat.description}
                    </p>

                    <h3 className="text-xl font-serif font-medium text-gray-900 tracking-wide border-b border-pink-100 pb-2 w-full max-w-[80%] mx-auto">
                        {stat.feature}
                    </h3>
                </motion.div>
            ))}
        </div>

      </div>
    </section>
  );
}