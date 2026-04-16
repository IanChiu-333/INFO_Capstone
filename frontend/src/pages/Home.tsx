import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import Container from '@cloudscape-design/components/container';

export default function Home() {
  return (
    <ContentLayout header={<Header variant="h1">Home</Header>}>
      <Container>
        <p>Welcome to the app.</p>
      </Container>
    </ContentLayout>
  );
}
