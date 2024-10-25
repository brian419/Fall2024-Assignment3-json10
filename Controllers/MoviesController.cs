using FALL2024_Assignment3_json10;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Fall2024_Assignment3_json10.Models;
using System.Threading.Tasks;

namespace FALL2024_Assignment3_json10.Controllers
{
    public class MoviesController : Controller
    {
        private readonly Fall2024_Assignment3_json10.Data.ApplicationDbContext _context;

        public MoviesController(Fall2024_Assignment3_json10.Data.ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            var movies = await _context.Movies.ToListAsync();
            return View(movies);
        }

        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Movie movie)
        {
            if (ModelState.IsValid)
            {
                _context.Add(movie);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(movie);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            Console.WriteLine($"DeleteConfirmed action hit for movie with ID: {id}");

            var movie = await _context.Movies.FindAsync(id);
            if (movie == null)
            {
                Console.WriteLine($"Movie with ID {id} not found.");
                return NotFound();
            }

            try
            {
                _context.Movies.Remove(movie);
                await _context.SaveChangesAsync();
                Console.WriteLine($"Movie with ID {id} deleted successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting movie: {ex.Message}");
                ModelState.AddModelError("", "Unable to delete movie from the database.");
            }

            return RedirectToAction(nameof(Index));
        }


        //reviews
        public async Task<IActionResult> Reviews(string title)
        {
            var movie = await _context.Movies.FirstOrDefaultAsync(m => m.Title == title);
            if (movie == null)
            {
                return NotFound();
            }
            return View(movie);
        }


    }
}
