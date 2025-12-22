export const ErrorContainer = ({
  error,
  status,
}: {
  error: string;
  status: number;
}) => {
  return (
    <div className="h-full w-full flex items-center justify-center flex-col">
      <div className="text-gray-500 font-bold text-[78px]">{status}</div>
      <div className="text-gray-600 font-normal text-2xl">{error}</div>
    </div>
  );
};
