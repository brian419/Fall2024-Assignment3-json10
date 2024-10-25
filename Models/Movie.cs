namespace Fall2024_Assignment3_json10.Models
{
    public class Movie
    {
        public int Id { get; set; }
        public required string Title { get; set; }
        public required string IMDBLink { get; set; }
        public required string Genre { get; set; }
        public int Year { get; set; }
        public required string Poster { get; set; }


        public ICollection<Actor> Actors { get; set; } = new List<Actor>();

    }
}
