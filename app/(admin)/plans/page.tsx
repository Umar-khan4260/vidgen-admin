export const dynamic = 'force-dynamic';

import { getPlansAction } from './actions';
import PlansClient from './PlansClient';

export default async function PlansPage() {
  const plans = await getPlansAction();

  return <PlansClient initialPlans={plans} />;
}
