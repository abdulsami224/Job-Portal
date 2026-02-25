import React, { useEffect } from 'react'
import useFetch from '@/hooks/use-fetch';
import { getSavedJobs } from '@/api/apiJobs';
import { BarLoader } from 'react-spinners';
import { useUser } from '@clerk/clerk-react';
import JobCard from '@/components/job-card';

const SaveJobs = () => {

  const { isLoaded } = useUser();

  const {
    loading: loadingSavedJobs,
    data: SavedJobs,
    fn: fnSavedJobs,
  } = useFetch(getSavedJobs);

  useEffect(() => {
    if (isLoaded) fnSavedJobs();
  }, [isLoaded]);

  if (!isLoaded || loadingSavedJobs) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }


  return (
    <div>
      <h1 className="gradient-title font-extrabold text-6xl sm:text-7xl text-center pb-8">
        Saved Jobs
      </h1>


      {loadingSavedJobs === false && (
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SavedJobs?.length ? (
                  SavedJobs.map((saved) => {
                      return <JobCard 
                        key={saved.id} 
                        job={saved?.job} 
                        savedInit={true}
                        onJobSaved={fnSavedJobs}
                        />;
                  })
              ) : (
                  <div>No Saved jobs found.</div>
              )}
          </div>
      )}
    </div>
  )
}

export default SaveJobs;