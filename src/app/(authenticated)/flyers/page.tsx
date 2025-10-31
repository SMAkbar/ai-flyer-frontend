"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FlyerCard } from "@/components/flyers/FlyerCard";
import { flyersApi, type FlyerRead } from "@/lib/api/flyers";

export default function FlyersPage() {
  const router = useRouter();
  const [flyers, setFlyers] = useState<FlyerRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFlyers();
  }, []);

  async function loadFlyers() {
    setIsLoading(true);
    setError(null);

    try {
      const result = await flyersApi.getAll();

      if (result.ok) {
        setFlyers(result.data);
      } else {
        setError(result.error.message || "Failed to load flyers");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">Loading flyers...</div>
      </div>
    );
  }

  if (error && flyers.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <Button onClick={loadFlyers}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Flyers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage and view all your flyers
          </p>
        </div>
        <Button onClick={() => router.push("/flyers/create")}>Create Flyer</Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {flyers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No flyers yet. Create your first flyer!</p>
          <Button onClick={() => router.push("/flyers/create")}>Create Flyer</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {flyers.map((flyer) => (
            <FlyerCard key={flyer.id} flyer={flyer} />
          ))}
        </div>
      )}
    </div>
  );
}

