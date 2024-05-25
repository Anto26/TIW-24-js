package it.polimi.tiw.servlets.api;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Optional;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.thymeleaf.context.WebContext;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import it.polimi.tiw.beans.Album;
import it.polimi.tiw.beans.Comment;
import it.polimi.tiw.beans.Image;
import it.polimi.tiw.beans.Person;
import it.polimi.tiw.dao.AlbumDAO;
import it.polimi.tiw.dao.ImageDAO;
import it.polimi.tiw.servlets.DataServlet;
import it.polimi.tiw.utils.GeneralUtility;
import it.polimi.tiw.utils.JsonUtility;
import it.polimi.tiw.utils.Pair;

@WebServlet("/getImages")
public class GetImagesServlet extends ApiServlet {
    private static final long serialVersionUID = -7291515526960117146L;
    private ImageDAO imageDAO;
    private AlbumDAO albumDAO;
    
	public GetImagesServlet() {
        super();
    }
	
	public void init() throws ServletException {
		super.init();
	}

	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		setJsonContent(response);
		Person user = (Person) request.getSession().getAttribute("user");

		String albumId = request.getParameter("albumId");
		if (albumId == null || !GeneralUtility.isNumeric(albumId)) {
			this.badRequestResponse(response, "albumId parameter not specified or wrong");
			return;
		}
		try {
			albumDAO = new AlbumDAO(this.dbConnection);
			imageDAO = new ImageDAO(this.dbConnection);

			Optional<Album> album = albumDAO.get(Integer.valueOf(albumId));
			if (album.isEmpty()) {
				this.badRequestResponse(response, "Album not found", 404);
				return;
			}
			Optional<Person> creator = personDAO.get(album.get().getCreatorId());
			// The album is available
			LinkedHashMap<Image, Pair<Person, List<Pair<Person, Comment>>>> res = imageDAO.getAlbumImagesWithCommentsOrdered(album.get(), user);
			JsonObject result = JsonUtility.mapToAlbumPage(album.get(), creator.get(), res);
			this.goodRequestResponse(response, result);
		} catch (SQLException e) {
			response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
			e.printStackTrace();
		}
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		this.doGet(request, response);
	}
	
	public void destory() {
		super.destroy();
		try {
			if (this.albumDAO != null) {
				this.albumDAO.close();
			}
			if (this.imageDAO != null) {
				this.imageDAO.close();
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
}
