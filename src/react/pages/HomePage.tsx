import React, { useEffect } from 'react'
import PageLayout from '../components/base/layout/PageLayout'
import HeroBackground from '../components/home/HeroBackground'
import HeroCanvas from '../components/home/HeroCanvas'
import HeroContent from '../components/home/HeroContent'
import { useProfile } from '../providers/ProfileProvider'
import { useRouter } from '../router/useRouter'
import { PATH_VALUES } from '../router/pathValues'

const HomePage = () => {
  const { isLoggedIn } = useProfile()
  const { navigateTo } = useRouter()
  useEffect(() => {
    if (isLoggedIn) navigateTo(PATH_VALUES.catalog())
  }, [isLoggedIn])

  return (
    <PageLayout fullHeight>
      <HeroBackground />
      <HeroCanvas>
        <HeroContent />
      </HeroCanvas>
    </PageLayout>
  )
}

export default HomePage
