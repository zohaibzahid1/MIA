import { graphQLApi } from './graphQlBaseApi';
import { UserAnalytics } from '@/types/analytics.types';

export async function fetchMyAnalytics(): Promise<UserAnalytics> {
  const query = `
    query MyAnalytics {
      myAnalytics {
        totalPatients
        totalScans
        averageScansPerPatient
        scanTypeDistribution {
          scanType
          count
        }
        statusBreakdown {
          status
          count
        }
      }
    }
  `;

  const response = await graphQLApi.query<{ myAnalytics: UserAnalytics }>(query);
  return response.myAnalytics;
}
