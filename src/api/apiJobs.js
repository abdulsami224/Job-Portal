import supabaseClient from "@/utils/supabase";


// export async function getJobs(token, { location, company_id, searchQuery }) {
//     const supabase = await supabaseClient(token);

//     let query = supabase.from('jobs').select("*, saved: saved_jobs(id), company: companies(name,logo_url)");

//     if (location) {
//         query = query.eq('location', location);
//     }

//     if (company_id) {
//         query = query.eq('company_id', company_id);
//     }

//     if (searchQuery) {
//         query = query.ilike('title', `%${searchQuery}%`);
//     }

//     const { data, error } = await query;

//     if (error) {
//         console.error('Error fetching jobs:', error);
//         return null;
//     }

//     return data;
// }

export async function getJobs(token, filters) {
  const supabase = await supabaseClient(token);

  let query = supabase
    .from("jobs")
    .select(`*, company: companies(name, logo_url)`);

  if (filters.location) query = query.eq("location", filters.location);
  if (filters.company_id) query = query.eq("company_id", filters.company_id);
  if (filters.searchQuery) query = query.ilike("title", `%${filters.searchQuery}%`);

  const { data: jobs, error } = await query;

  if (error) {
    console.error("Error fetching jobs:", error);
    return null;
  }

  // fetch saved jobs separately
  const { data: savedJobs } = await supabase
    .from("saved_jobs")
    .select("*")
    .eq("user_id", filters.user_id);

  // attach saved array to each job manually
  const jobsWithSaved = jobs.map((job) => ({
    ...job,
    saved: savedJobs?.filter((s) => s.job_id === job.id) || [],
  }));

  return jobsWithSaved;
}

export async function saveJob(token, _, saveData) {
  const supabase = await supabaseClient(token);

  console.log("Saving job with:", saveData); // ✅ add this

  const { data, error } = await supabase
    .from("saved_jobs")
    .insert([{
      user_id: saveData.user_id,
      job_id: saveData.job_id,
    }])
    .select();

  console.log("Save result:", data, error); // ✅ add this

  if (error) {
    console.error("Error saving job:", error);
  }

  return data;
}

export async function unsaveJob(token, _, saveData) {  // ✅ skip options with _
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("job_id", saveData.job_id)
    .eq("user_id", saveData.user_id);

  if (error) {
    console.error("Error removing saved job:", error);
  }

  return data;
}

export async function getSingleJob(token, { job_id }) {
    const supabase = await supabaseClient(token);

    const { data, error } = await supabase
    .from('jobs')
    .select("*, company: companies(name,logo_url), applications: applications(*)")
    .eq('id', job_id)
    .single();

    if (error) {
        console.error('Error fetching job details:', error);
        return null;
    }

    return data;
}

export async function updateHiringStatus(token, { job_id }, isOpen) {
    const supabase = await supabaseClient(token);

    const { data, error } = await supabase
    .from('jobs')
    .update({ isOpen })
    .eq('id', job_id)
    .select();

    if (error) {
        console.error('Error updating hiring status:', error);
        return null;
    }

    return data;
}

export async function addNewJob(token, _, jobData) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .insert([jobData])
    .select();

  if (error) {
    console.error(error);
    throw new Error("Error Creating Job");
  }

  return data;
}


export async function getSavedJobs(token, _, { user_id }) { 
    const supabase = await supabaseClient(token);

    const { data, error } = await supabase
        .from("saved_jobs")
        .select("*, job: jobs(*, company: companies(name, logo_url))")
        .eq("user_id", user_id); 

    if (error) {
        console.error("Error fetching saved jobs:", error);
        return null;
    }

    return data;
}

export async function getMyJobs(token, { recruiter_id }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .select("*, company: companies(name,logo_url)")
    .eq("recruiter_id", recruiter_id);

  if (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }

  return data;
}

export async function deleteJob(token, { job_id }) {
  const supabase = await supabaseClient(token);

  const { data, error: deleteError } = await supabase
    .from("jobs")
    .delete()
    .eq("id", job_id)
    .select();

  if (deleteError) {
    console.error("Error Deleting Job:", deleteError);
    return null;
  }

  return data;
}