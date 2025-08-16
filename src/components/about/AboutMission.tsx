'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Target, Lightbulb, Shield, Globe } from 'lucide-react'

export function AboutMission() {
  const missions = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To demystify cryptocurrency and blockchain technology, making complex financial concepts accessible to everyone through clear, actionable insights.",
      color: "from-purple-500 to-blue-500"
    },
    {
      icon: Lightbulb,
      title: "Our Vision",
      description: "A world where everyone has the knowledge and confidence to participate in the digital economy and make informed financial decisions.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Our Values",
      description: "Transparency, accuracy, and education-first approach. We believe in empowering our readers with unbiased, well-researched content.",
      color: "from-cyan-500 to-teal-500"
    },
    {
      icon: Globe,
      title: "Our Impact",
      description: "Building a global community of informed crypto enthusiasts who can navigate the digital asset landscape with confidence and clarity.",
      color: "from-teal-500 to-green-500"
    }
  ]

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Why Monday Sippin' Exists
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Born from the belief that everyone deserves access to clear, reliable cryptocurrency education. 
            We're here to be your guide in the ever-evolving world of digital assets.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {missions.map((mission, index) => {
            const Icon = mission.icon
            return (
              <motion.div
                key={mission.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-r ${mission.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          {mission.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {mission.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Quote section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl p-12 text-white max-w-4xl mx-auto">
            <blockquote className="text-2xl md:text-3xl font-medium mb-6 leading-relaxed">
              "Knowledge is the best investment you can make in the crypto space. 
              We're here to help you make that investment wisely."
            </blockquote>
            <cite className="text-lg opacity-90">— The Monday Sippin' Team</cite>
          </div>
        </motion.div>
      </div>
    </section>
  )
}