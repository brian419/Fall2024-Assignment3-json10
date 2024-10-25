using FALL2024_Assignment3_json10;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Fall2024_Assignment3_json10.Models;
using System;
using System.Collections.Generic;
using System.Linq;
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
        [Route("Movies/DeleteConfirmed")]
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

        public async Task<IActionResult> Reviews(string title)
        {
            Console.WriteLine("Reached the Reviews action");

            var movie = await _context.Movies.FirstOrDefaultAsync(m => m.Title == title);
            if (movie == null)
            {
                return NotFound();
            }

            if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
            {
                return Json(movie);
            }

            return View(movie);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {
            var movie = await _context.Movies.FindAsync(id);
            if (movie == null)
            {
                return NotFound();
            }
            return View(movie);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Movie movie)
        {
            if (id != movie.Id)
            {
                return BadRequest();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(movie);
                    await _context.SaveChangesAsync();
                    return RedirectToAction(nameof(Index));
                }
                catch (DbUpdateException)
                {
                    ModelState.AddModelError("", "Unable to save changes. Try again, and if the problem persists, see your system administrator.");
                }
            }
            return View(movie);
        }

        public async Task<IActionResult> MovieDetails(int id)
        {
            try
            {
                var movie = await _context.Movies
                    .Include(m => m.Actors) 
                    .FirstOrDefaultAsync(m => m.Id == id);

                if (movie == null)
                {
                    Console.WriteLine($"Movie with ID {id} not found.");
                    return NotFound();
                }

                ViewBag.AllActors = await _context.Actors.ToListAsync();
                return View(movie);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading movie details: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddActorsToMovie(int movieId, List<int> actorIds)
        {
            var movie = await _context.Movies
                .Include(m => m.Actors)
                .FirstOrDefaultAsync(m => m.Id == movieId);

            if (movie == null)
            {
                return NotFound();
            }

            var actorsToAdd = await _context.Actors
                .Where(a => actorIds.Contains(a.Id) && !movie.Actors.Contains(a))
                .ToListAsync();

            foreach (var actor in actorsToAdd)
            {
                movie.Actors.Add(actor);
            }

            await _context.SaveChangesAsync();

            return RedirectToAction(nameof(MovieDetails), new { id = movieId });
        }
    }
}
