using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Fall2024_Assignment3_json10.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureActorMovieManyToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ActorMovie_Actors_ActorsId",
                table: "ActorMovie");

            migrationBuilder.DropForeignKey(
                name: "FK_ActorMovie_Movies_MoviesId",
                table: "ActorMovie");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ActorMovie",
                table: "ActorMovie");

            migrationBuilder.RenameTable(
                name: "ActorMovie",
                newName: "MovieActors");

            migrationBuilder.RenameIndex(
                name: "IX_ActorMovie_MoviesId",
                table: "MovieActors",
                newName: "IX_MovieActors_MoviesId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MovieActors",
                table: "MovieActors",
                columns: new[] { "ActorsId", "MoviesId" });

            migrationBuilder.AddForeignKey(
                name: "FK_MovieActors_Actors_ActorsId",
                table: "MovieActors",
                column: "ActorsId",
                principalTable: "Actors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MovieActors_Movies_MoviesId",
                table: "MovieActors",
                column: "MoviesId",
                principalTable: "Movies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MovieActors_Actors_ActorsId",
                table: "MovieActors");

            migrationBuilder.DropForeignKey(
                name: "FK_MovieActors_Movies_MoviesId",
                table: "MovieActors");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MovieActors",
                table: "MovieActors");

            migrationBuilder.RenameTable(
                name: "MovieActors",
                newName: "ActorMovie");

            migrationBuilder.RenameIndex(
                name: "IX_MovieActors_MoviesId",
                table: "ActorMovie",
                newName: "IX_ActorMovie_MoviesId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ActorMovie",
                table: "ActorMovie",
                columns: new[] { "ActorsId", "MoviesId" });

            migrationBuilder.AddForeignKey(
                name: "FK_ActorMovie_Actors_ActorsId",
                table: "ActorMovie",
                column: "ActorsId",
                principalTable: "Actors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ActorMovie_Movies_MoviesId",
                table: "ActorMovie",
                column: "MoviesId",
                principalTable: "Movies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
