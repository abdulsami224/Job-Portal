import { getJobs } from '@/api/apiJobs';
import { getCompanies } from '@/api/apiCompanies';
import useFetch from '@/hooks/use-fetch';
import { useUser } from '@clerk/clerk-react';
import React, { useEffect, useState } from 'react'
import { BarLoader } from 'react-spinners';
import JobCard from '@/components/job-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"
import { City } from 'country-state-city';

const JobListing = () => {

  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [company_id, setCompany_id] = useState("");
  const { isLoaded  } = useUser();

  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6; 

  const {
    // loading: loadingCompanies,
    data: companies,
    fn: fnCompanies,
  } = useFetch(getCompanies);

  const {
    loading: loadingJobs,
    data: jobs,
    fn: fnJobs,
  } = useFetch(getJobs, {
    location,
    company_id,
    searchQuery,
  });

  useEffect(() => {
    if (isLoaded) {
      fnCompanies();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isLoaded) fnJobs();
  }, [isLoaded, location, company_id, searchQuery]);



  const handleSearch = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const query = formData.get("search-query");

    if (query) setSearchQuery(query);
  }

  const clearFilters = () => {
    setSearchQuery("");
    setCompany_id("");
    setLocation("");
  };
    
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs?.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil((jobs?.length || 0) / jobsPerPage);


  if (!isLoaded) {
    return <BarLoader className="mb-4" width={"100%"} color="36d7b7" />;
  }

  return (
    <div>
      <h1 className="gradient-title font-extrabold text-6xl sm:text-7xl text-center pb-8">
          Latest Jobs
      </h1>

      {/* Search and filter section */}
      <form onSubmit={handleSearch} className="h-14 flex flex-row w-full gap-2 items-center mb-3">
        <Input
          type="text"
          placeholder="Search jobs by Title.."
          name="search-query"
          className="h-full flex-1 px-4 text-md"
        />
          <Button type="submit" className="h-full sm:w-28" variant='blue'>
            Search
          </Button>
      </form>

<div className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr] gap-4 w-full">

  <Select value={location} onValueChange={(value) => setLocation(value)}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Filter by Location" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        {City.getCitiesOfCountry("PK").map(({ name }, index) => (
          <SelectItem key={`${name}-${index}`} value={name}>
            {name}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>

  <Select value={company_id} onValueChange={(value) => setCompany_id(value)}>
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Filter by Company" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        {companies.map((company) => (
          <SelectItem key={company.id} value={String(company.id)}>
            {company.name}
          </SelectItem>
        ))}
      </SelectGroup>
    </SelectContent>
  </Select>
  

  <Button
    className="w-full"
    variant="destructive"
    onClick={clearFilters}
  >
    Clear Filters
  </Button>

</div>

      {loadingJobs && (
          <BarLoader className="mb-4" width={"100%"} color="36d7b7" />
      )}

      {loadingJobs === false && (
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentJobs?.length ? (
                  currentJobs.map((job) => {
                      return <JobCard 
                        key={job.id} 
                        job={job} 
                        savedInit={job?.saved?.length > 0}
                        />;
                  })
              ) : (
                  <div>No jobs found.</div>
              )}
          </div>
      )}

      <Pagination className="mt-8">
        <PaginationContent>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={currentPage === page}
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentPage(page);
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default JobListing