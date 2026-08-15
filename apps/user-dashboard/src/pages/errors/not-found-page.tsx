import { useNavigate } from 'react-router-dom';

import { ErrorState } from '@/components/errors/error-state';
import { getErrorDefinition } from '@/errors/error-catalog';
import { ERROR_CODES } from '@/errors/error-codes';

export function NotFoundPage() {
  const navigate = useNavigate();
  const definition = getErrorDefinition(ERROR_CODES.NOT_FOUND);

  return (
    <main className="grid min-h-[100svh] place-items-center bg-[#f7f8fa] p-4">
      <ErrorState
        description={definition.userMessage}
        goBack={() => navigate(-1)}
        goHome={() => navigate('/')}
        title={definition.title}
        variant="not-found"
      />
    </main>
  );
}
