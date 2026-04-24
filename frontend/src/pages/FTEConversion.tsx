import Table from '@cloudscape-design/components/table';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import { useFTEConversions } from '../hooks/useFTEConversions';
import type { FTEConversionRecord } from '../services';

export default function FTEConversion() {
  const { conversions, loading } = useFTEConversions();

  if (loading) return null;

  return (
    <Table
      header={
        <Header
          variant="h2"
          description="Graduation and full-time hiring tracking"
          counter={`(${conversions.length} Total)`}
        >
          FTE Conversion
        </Header>
      }
      columnDefinitions={[
        { id: 'internName',       header: 'Intern Name',       cell: (r: FTEConversionRecord) => r.internName },
        { id: 'manager',          header: 'Manager',           cell: (r: FTEConversionRecord) => r.manager },
        { id: 'location',         header: 'Location',          cell: (r: FTEConversionRecord) => r.location },
        { id: 'graduationDate',   header: 'Graduation Date',   cell: (r: FTEConversionRecord) => r.graduationDate },
        { id: 'conversionStatus', header: 'Conversion Status', cell: (r: FTEConversionRecord) => r.conversionStatus },
        { id: 'offerDate',        header: 'Offer Date',        cell: (r: FTEConversionRecord) => r.offerDate ?? '—' },
        { id: 'headcountSource',  header: 'HC Source',         cell: (r: FTEConversionRecord) => r.headcountSource ?? '—' },
      ]}
      items={conversions}
      empty={<Box textAlign="center">No conversion records found.</Box>}
    />
  );
}
