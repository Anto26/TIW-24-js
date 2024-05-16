package it.polimi.tiw.servlets.api;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLEncoder;
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

import com.google.gson.JsonObject;

import it.polimi.tiw.beans.Album;
import it.polimi.tiw.beans.Comment;
import it.polimi.tiw.beans.Image;
import it.polimi.tiw.beans.Person;
import it.polimi.tiw.dao.AlbumDAO;
import it.polimi.tiw.dao.ImageDAO;
import it.polimi.tiw.utils.GeneralUtility;
import it.polimi.tiw.utils.JsonUtility;
import it.polimi.tiw.utils.Pair;

@WebServlet("/deleteOrder")
public class DeleteOrderServlet extends ApiServlet {
    private static final long serialVersionUID = -1397515526960117146L;
    
	public DeleteOrderServlet() {
        super();
    }
	
	public void init() throws ServletException {
		super.init();
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		setJsonContent(response);
		Person user = (Person) request.getSession().getAttribute("user");		

		String albumParameter = request.getParameter("albumId");

		if (!GeneralUtility.isValidNumericParameter(albumParameter)) {
			badRequestResponse(response, "The album id is invalid");
			return;
		}
		Integer albumId = Integer.parseInt(albumParameter);
		Album album = null;
		AlbumDAO albumDAO;
		try {
			albumDAO = new AlbumDAO(this.dbConnection);
			Optional<Album> fetchedAlbum = albumDAO.get(albumId);
			if (!fetchedAlbum.isPresent()) {
				badRequestResponse(response, "The given album does not exist", 404);
				return;			
			} else {
				album = fetchedAlbum.get();
				albumDAO.deleteOrder(album, user);
			}
		} catch (SQLException e) {
			badRequestResponse(response, "Could not connect to the database", 500);
			return;
		}
		try {
			ImageDAO imageDAO = new ImageDAO(this.dbConnection);
			Optional<Person> creator = personDAO.get(album.getCreatorId());
			LinkedHashMap<Image, Pair<Person, List<Pair<Person, Comment>>>> res = imageDAO.getAlbumImagesWithCommentsOrdered(album, user);
			JsonObject result = JsonUtility.mapToAlbumPage(album, creator.get(), res);
			this.goodRequestResponse(response, result);
		} catch (SQLException e) {
			e.printStackTrace();
			this.badRequestResponse(response,"There was an error connecting to the database",  500);
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doGet(request, response);
	}
}
