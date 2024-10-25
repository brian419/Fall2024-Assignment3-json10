using Fall2024_Assignment3_json10.Models;
using Microsoft.EntityFrameworkCore;

namespace Fall2024_Assignment3_json10.Data 
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Movie> Movies { get; set; }
        public DbSet<Actor> Actors { get; set; }
    }
}
