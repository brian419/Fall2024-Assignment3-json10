using System.Collections.Generic;
using Fall2024_Assignment3_json10.Models;

namespace Fall2024_Assignment3_json10.ViewModels
{
    public class MovieDetailsViewModel
    {
        public required Movie Movie { get; set; }
        public required IEnumerable<Actor> AllActors { get; set; }
    }
}
