'use client'

import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'motion/react'

const languageFlags = [
  {
    flag: 'https://flagcdn.com/us.svg',
    label: 'English',
  },
  {
    flag: 'https://flagcdn.com/fr.svg',
    label: 'French',
  },
  {
    flag: 'https://flagcdn.com/de.svg',
    label: 'German',
  },
]

const ArticlePreviewCard = () => {
  return (
    <div className='flex items-center justify-center'>
      {/* Card Motion Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className='w-full max-w-sm'>
        <Card className='p-0 w-full gap-0 border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden rounded-[2.5rem] hover:border-primary/30 transition-all shadow-sm'>
          {/* Top Image Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className='relative h-48 w-full overflow-hidden'>
            <img
              src='/MoviesCollection.jpg'
              alt='Learning from movies'
              className='w-full h-full object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-background/80 to-transparent' />
          </motion.div>

          {/* Content Area */}
          <CardContent className='p-8 pt-5'>
            <motion.div
              initial='hidden'
              animate='visible'
              variants={{
                visible: { transition: { staggerChildren: 0.15 } },
              }}>
              <motion.h3
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4 }}
                className='text-xl font-bold text-foreground'>
                Master Real Expressions
              </motion.h3>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.45 }}
                className='text-sm font-medium text-muted-foreground mt-2 leading-relaxed'>
                Learn how native speakers use idioms and slang in their natural environment — within your favorite movies and shows.
              </motion.p>
            </motion.div>

            <motion.div
              className='flex mt-6'
              initial='hidden'
              animate='visible'
              variants={{
                visible: {
                  transition: { staggerChildren: 0.12 },
                },
              }}>
              {languageFlags.map((item, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, scale: 1 },
                    visible: { opacity: 1, scale: 1 },
                  }}
                  whileHover={{ scale: 1.15, zIndex: 20 }}
                  transition={{ type: 'spring', stiffness: 250 }}
                  className='-ms-3 h-10 w-10 relative z-10 first:ms-0'>
                  <div className='w-full h-full rounded-full border-2 border-background overflow-hidden shadow-md bg-muted'>
                    <img
                      src={item.flag}
                      className='w-full h-full object-cover'
                      alt={item.label}
                    />
                  </div>
                </motion.div>
              ))}

              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 1 },
                  visible: { opacity: 1, scale: 1 },
                }}
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 250 }}
                className='-ms-3 relative z-0'>
                <div className='bg-muted h-10 w-10 flex justify-center items-center text-muted-foreground border-2 border-background rounded-full text-xs font-black shadow-md'>
                  +3
                </div>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default ArticlePreviewCard
