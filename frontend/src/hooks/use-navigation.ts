import { useRouter } from 'next/navigation';

export const useNavigation = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    // Use router.push for navigation
    router.push(path);
  };

  const navigateBack = () => {
    router.back();
  };

  const navigateForward = () => {
    router.forward();
  };

  const replace = (path: string) => {
    router.replace(path);
  };

  return {
    navigateTo,
    navigateBack,
    navigateForward,
    replace,
    router,
  };
};
