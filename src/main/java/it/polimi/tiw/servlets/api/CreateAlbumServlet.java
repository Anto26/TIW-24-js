package it.polimi.tiw.servlets.api;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.thymeleaf.context.WebContext;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import it.polimi.tiw.beans.Album;
import it.polimi.tiw.beans.Image;
import it.polimi.tiw.beans.Person;
import it.polimi.tiw.dao.AlbumDAO;
import it.polimi.tiw.dao.ImageDAO;
import it.polimi.tiw.servlets.DataServlet;
import it.polimi.tiw.utils.CreateAlbumUtility;
import it.polimi.tiw.utils.JsonUtility;

@WebServlet("/createAlbum")
public class CreateAlbumServlet extends ApiServlet {
    private static final long serialVersionUID = -7297515526960117146L;
    private Gson gson = new Gson();
    
	public CreateAlbumServlet() {
        super();
    }
	
	public void init() throws ServletException {
		super.init();
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		setJsonContent(response);
		Person user = (Person) request.getSession().getAttribute("user");

		// Check title param
		String title = request.getParameter("title");
		if (title == "" || title.length() > 30) {
			badRequestResponse(response, "Wrong title given, the title must be at least one character and maximum 30 characters");
			return;
		}

		try {
			ImageDAO imageDAO = new ImageDAO(this.dbConnection);
			AlbumDAO albumDAO = new AlbumDAO(this.dbConnection);
			// Get the list of the given parameters
			Set<String> parameters = request.getParameterMap().keySet();
			int[] ids = parameters.stream().filter(CreateAlbumUtility::isNumeric).mapToInt(Integer::parseInt).toArray();
			// Check that every id is an image from this user
			for (int id : ids) {
				Optional<Image> img = imageDAO.get(id);
				if (img.isEmpty() || img.get().getUploaderId() != user.getId()) {
					badRequestResponse(response, "Wrong image selected");
					return;
				}
			}
			if (ids.length < 1) {
				badRequestResponse(response, "You have to choose at least one image to create an album");
				return;
			}

			// Save the album
			Optional<Album> album = albumDAO.save(title, String.valueOf(user.getId()));
			// Save the images
			for (int id : ids) {
				if (request.getParameter(String.valueOf(id)).equals("on"))
					albumDAO.addImage(album.get().getId(), id);
			}
			// Give the result
			JsonObject result = new JsonObject();
			result.addProperty("id", album.get().getId());
			this.goodRequestResponse(response, result);
			
		} catch (SQLException e) {
			badRequestResponse(response, "Could not connect to the database", 500);
			return;
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doGet(request, response);
	}
}
