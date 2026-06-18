const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hqktrwdbbdgbjnbvklma.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhxa3Ryd2RiYmRnYmpuYnZrbG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNzA1NDksImV4cCI6MjA5Njg0NjU0OX0.hjmpBgg5M3hqPBwK54ez26I0wdvZfsaRd9mZfdOG7qQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'testebrielagoon@gmail.com',
    password: 'Password123!',
  });

  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('User created:', data.user?.email);
  }
}

createUser();
