import { Suspense } from 'react';
import ProfileCreation from '@/components/profile/ProfileCreation';

export default function ProfileCreationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileCreation />
    </Suspense>
  );
}